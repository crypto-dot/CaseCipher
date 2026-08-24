"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createAttachment,
  listAllCaseAttachments as dbListAllCaseAttachments,
  listCaseAttachments as dbListCaseAttachments,
  listEvidenceAttachments as dbListEvidenceAttachments,
  getAttachmentById,
  softDeleteAttachment,
} from "@/db/queries/attachments";
import { createAuditLog } from "@/db/queries/audit";
import {
  createRemoteDownloadUrl,
  deleteAttachmentBlob,
  hasLocalAttachment,
  storeAttachmentBlob,
} from "@/lib/attachment-storage";
import { requireUser } from "@/lib/auth/session";
import {
  allowedAttachmentContentTypes,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_UPLOAD,
} from "@/lib/types/attachment-types";
import type { CaseAttachment } from "@/lib/types/case-types";

const DOWNLOAD_URL_TTL_MS = 10 * 60 * 1000;

type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

const uploadTargetSchema = z.object({
  caseId: z.uuid(),
  evidenceId: z.uuid().optional(),
});

const attachmentIdSchema = z.uuid();

function getAllowedContentTypes() {
  const configured = (process.env.ALLOWED_ATTACHMENT_CONTENT_TYPES ?? "")
    .split(",")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);

  return configured.length > 0
    ? configured
    : [...allowedAttachmentContentTypes];
}

function getMaxUploadBytes() {
  const configured = Number.parseInt(
    process.env.MAX_ATTACHMENT_UPLOAD_BYTES ?? "",
    10,
  );

  return Number.isFinite(configured) && configured > 0
    ? configured
    : MAX_ATTACHMENT_SIZE_BYTES;
}

function sanitizeFilename(filename: string) {
  const sanitized = filename
    .replace(/[\\/]/g, "-")
    .replace(/[^\w.\- ]+/g, "_")
    .trim()
    .slice(0, 180);

  return sanitized || "attachment";
}

function contentTypeFor(file: File) {
  const type = (file.type || "application/octet-stream").toLowerCase();
  const allowedTypes = getAllowedContentTypes();
  return allowedTypes.includes(type) ? type : "application/octet-stream";
}

function assertUploadAllowed(files: File[]) {
  if (files.length === 0) {
    throw new Error("Select at least one file to upload");
  }

  if (files.length > MAX_ATTACHMENTS_PER_UPLOAD) {
    throw new Error(
      `Upload no more than ${MAX_ATTACHMENTS_PER_UPLOAD} files at once`,
    );
  }

  const maxBytes = getMaxUploadBytes();
  const allowedTypes = getAllowedContentTypes();

  for (const file of files) {
    const contentType = contentTypeFor(file);

    if (file.size <= 0) {
      throw new Error(`${file.name || "File"} is empty`);
    }

    if (file.size > maxBytes) {
      throw new Error(
        `${file.name} exceeds the ${(maxBytes / (1024 * 1024)).toFixed(0)} MB upload limit`,
      );
    }

    if (!allowedTypes.includes(contentType)) {
      throw new Error(`${file.name} uses unsupported type ${contentType}`);
    }
  }
}

function buildPathname(caseId: string, filename: string, evidenceId?: string) {
  const scope = evidenceId ? `evidence/${evidenceId}` : "case";
  return `cases/${caseId}/${scope}/${randomUUID()}-${sanitizeFilename(filename)}`;
}

async function hashFileSha256(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return createHash("sha256").update(buffer).digest("hex");
}

async function logAttachmentAction(params: {
  user: AuthUser;
  action: string;
  attachmentId: string;
  caseId: string;
  evidenceId?: string | null;
  changes?: Record<string, unknown>;
}) {
  await createAuditLog({
    userId: params.user.id,
    userEmail: params.user.email,
    userName: params.user.name ?? null,
    action: `attachment.${params.action}`,
    entityType: "attachment",
    entityId: params.attachmentId,
    changes: {
      ...params.changes,
      caseId: params.caseId,
      evidenceId: params.evidenceId ?? null,
    },
  });
}

function revalidateAttachmentPaths(caseId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cases");
  revalidatePath(`/dashboard/cases/${caseId}`);
  revalidatePath("/dashboard/evidence");
}

function isUploadedFile(entry: FormDataEntryValue): entry is File {
  return (
    typeof entry === "object" &&
    entry !== null &&
    typeof (entry as File).arrayBuffer === "function" &&
    typeof (entry as File).size === "number" &&
    typeof (entry as File).name === "string"
  );
}

function filesFromFormData(formData: FormData) {
  return formData.getAll("files").filter(isUploadedFile);
}

function targetFromFormData(formData: FormData) {
  const caseId = String(formData.get("caseId") ?? "");
  const evidenceId = formData.get("evidenceId");

  return uploadTargetSchema.parse({
    caseId,
    evidenceId: evidenceId ? String(evidenceId) : undefined,
  });
}

export async function listCaseAttachments(caseId: string) {
  await requireUser();
  return dbListCaseAttachments(z.uuid().parse(caseId));
}

export async function listAllCaseAttachments() {
  await requireUser();
  return dbListAllCaseAttachments();
}

export async function listEvidenceAttachments(evidenceId: string) {
  await requireUser();
  return dbListEvidenceAttachments(z.uuid().parse(evidenceId));
}

export async function uploadCaseAttachments(
  formData: FormData,
): Promise<CaseAttachment[]> {
  console.log("test")
  console.log("uploadCaseAttachments", formData);
  const user = await requireUser();
  const target = targetFromFormData(formData);
  const files = filesFromFormData(formData);

  assertUploadAllowed(files);

  const uploaded: CaseAttachment[] = [];

  for (const file of files) {
    const filename = sanitizeFilename(file.name);
    const contentType = contentTypeFor(file);
    const pathname = buildPathname(target.caseId, filename, target.evidenceId);
    const [sha256, blob] = await Promise.all([
      hashFileSha256(file),
      storeAttachmentBlob(pathname, file, contentType),
    ]);

    const attachment = await createAttachment({
      caseId: target.caseId,
      evidenceId: target.evidenceId ?? null,
      pathname: blob.pathname,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      filename,
      contentType,
      size: file.size,
      sha256,
      md5: null,
      uploadedBy: user.id,
    });

    await logAttachmentAction({
      user,
      action: "uploaded",
      attachmentId: attachment.id,
      caseId: attachment.caseId,
      evidenceId: attachment.evidenceId,
      changes: {
        after: {
          filename: attachment.filename,
          size: attachment.size,
          contentType: attachment.contentType,
          sha256: attachment.sha256,
          pathname: attachment.pathname,
        },
      },
    });

    uploaded.push(attachment);
  }

  revalidateAttachmentPaths(target.caseId);
  return dbListCaseAttachments(target.caseId);
}

export async function uploadEvidenceMedia(
  formData: FormData,
): Promise<CaseAttachment[]> {
  return uploadCaseAttachments(formData);
}

export async function deleteCaseAttachment(
  id: string,
): Promise<CaseAttachment[]> {
  const user = await requireUser();
  const attachmentId = attachmentIdSchema.parse(id);
  const attachment = await getAttachmentById(attachmentId);
  if (!attachment) {
    throw new Error("Attachment not found");
  }

  await deleteAttachmentBlob(attachment.pathname);
  const deleted = await softDeleteAttachment(attachmentId);
  if (!deleted) {
    throw new Error("Failed to delete attachment");
  }

  await logAttachmentAction({
    user,
    action: "deleted",
    attachmentId: attachment.id,
    caseId: attachment.caseId,
    evidenceId: attachment.evidenceId,
    changes: {
      before: {
        filename: attachment.filename,
        size: attachment.size,
        contentType: attachment.contentType,
        sha256: attachment.sha256,
        pathname: attachment.pathname,
      },
    },
  });

  revalidateAttachmentPaths(attachment.caseId);
  return dbListCaseAttachments(attachment.caseId);
}

export async function getCaseAttachmentDownloadUrl(id: string) {
  const user = await requireUser();
  const attachmentId = attachmentIdSchema.parse(id);
  const attachment = await getAttachmentById(attachmentId);
  if (!attachment) {
    throw new Error("Attachment not found");
  }

  const validUntil = Date.now() + DOWNLOAD_URL_TTL_MS;
  const presignedUrl = (await hasLocalAttachment(attachment.pathname))
    ? `/api/attachments/${attachment.id}`
    : await createRemoteDownloadUrl(attachment.pathname, validUntil);

  await logAttachmentAction({
    user,
    action: "download_url_issued",
    attachmentId: attachment.id,
    caseId: attachment.caseId,
    evidenceId: attachment.evidenceId,
    changes: {
      attachmentId: attachment.id,
      filename: attachment.filename,
      validUntil,
    },
  });

  return {
    url: presignedUrl,
    filename: attachment.filename,
    expiresAt: new Date(validUntil).toISOString(),
  };
}
