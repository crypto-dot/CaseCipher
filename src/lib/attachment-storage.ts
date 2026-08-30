import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, issueSignedToken, presignUrl, put } from "@vercel/blob";

export type StoredBlob = {
  pathname: string;
  url: string;
  downloadUrl: string | null;
};

const LOCAL_ROOT = path.join(process.cwd(), ".data", "attachments");

export function isRemoteBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localFilePath(pathname: string) {
  const segments = pathname
    .replaceAll("\\", "/")
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..");

  if (segments.length === 0) {
    throw new Error("Invalid attachment path");
  }

  return path.join(LOCAL_ROOT, ...segments);
}

export async function hasLocalAttachment(pathname: string) {
  try {
    await access(localFilePath(pathname));
    return true;
  } catch {
    return false;
  }
}

export async function storeAttachmentBlob(
  pathname: string,
  file: File,
  contentType: string,
): Promise<StoredBlob> {
  console.log("isRemoteBlobConfigured", isRemoteBlobConfigured());
  if (isRemoteBlobConfigured()) {
    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: false,
      contentType,
      multipart: file.size > 10 * 1024 * 1024,
    });
    return {
      pathname: blob.pathname,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
    };
  }

  const filePath = localFilePath(pathname);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  return {
    pathname,
    url: `local://${pathname}`,
    downloadUrl: null,
  };
}

export async function deleteAttachmentBlob(pathname: string) {
  invalidateRemoteDownloadUrl(pathname);

  if (await hasLocalAttachment(pathname)) {
    await unlink(localFilePath(pathname));
    return;
  }

  if (isRemoteBlobConfigured()) {
    await del(pathname);
  }
}

export async function readLocalAttachment(pathname: string) {
  return readFile(localFilePath(pathname));
}

export const DOWNLOAD_URL_TTL_MS = 1 * 60 * 1000;
const DOWNLOAD_URL_REFRESH_BUFFER_MS = 30 * 1000;

type CachedSignedUrl = {
  url: string;
  expiresAt: number;
};

const globalForBlob = globalThis as typeof globalThis & {
  attachmentSignedUrls?: Map<string, CachedSignedUrl>;
  attachmentSignedUrlPending?: Map<string, Promise<CachedSignedUrl>>;
};

if (!globalForBlob.attachmentSignedUrls) {
  globalForBlob.attachmentSignedUrls = new Map();
}
if (!globalForBlob.attachmentSignedUrlPending) {
  globalForBlob.attachmentSignedUrlPending = new Map();
}

const signedUrlCache = globalForBlob.attachmentSignedUrls;
const signedUrlPending = globalForBlob.attachmentSignedUrlPending;

export function invalidateRemoteDownloadUrl(pathname: string) {
  signedUrlCache.delete(pathname);
  signedUrlPending.delete(pathname);
}

export async function createRemoteDownloadUrl(
  pathname: string,
  validUntil: number,
) {
  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
  });
  const { presignedUrl } = await presignUrl(signedToken, {
    access: "private",
    operation: "get",
    pathname,
    validUntil,
  });

  return presignedUrl;
}

export async function getRemoteDownloadUrl(pathname: string) {
  const cached = signedUrlCache.get(pathname);
  if (
    cached &&
    cached.expiresAt - DOWNLOAD_URL_REFRESH_BUFFER_MS > Date.now()
  ) {
    return cached;
  }

  const pending = signedUrlPending.get(pathname);
  if (pending) {
    return pending;
  }

  const request = (async () => {
    const expiresAt = Date.now() + DOWNLOAD_URL_TTL_MS;
    const url = await createRemoteDownloadUrl(pathname, expiresAt);
    const next: CachedSignedUrl = { url, expiresAt };
    signedUrlCache.set(pathname, next);
    return next;
  })().finally(() => {
    signedUrlPending.delete(pathname);
  });

  signedUrlPending.set(pathname, request);
  return request;
}
