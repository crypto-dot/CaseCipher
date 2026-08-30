import { NextResponse } from "next/server";
import { z } from "zod";
import { getAttachmentById } from "@/db/queries/attachments";
import { createAuditLog } from "@/db/queries/audit";
import {
  getRemoteDownloadUrl,
  hasLocalAttachment,
  isRemoteBlobConfigured,
  readLocalAttachment,
} from "@/lib/attachment-storage";
import { requireUser } from "@/lib/auth/session";

const attachmentIdSchema = z.uuid();

function contentDisposition(filename: string) {
  const ascii = filename.replace(/[^\x20-\x7E]+/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const parsedId = attachmentIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json(
      { error: "Attachment not found" },
      { status: 404 },
    );
  }

  const attachment = await getAttachmentById(parsedId.data);
  if (!attachment) {
    return NextResponse.json(
      { error: "Attachment not found" },
      { status: 404 },
    );
  }

  const file = attachment;

  async function logDownload(validUntil?: number) {
    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.name ?? null,
      action: "attachment.downloaded",
      entityType: "attachment",
      entityId: file.id,
      changes: {
        attachmentId: file.id,
        filename: file.filename,
        caseId: file.caseId,
        evidenceId: file.evidenceId ?? null,
        ...(validUntil ? { validUntil } : {}),
      },
    });
  }

  if (await hasLocalAttachment(file.pathname)) {
    await logDownload();
    const body = await readLocalAttachment(file.pathname);
    return new NextResponse(Uint8Array.from(body), {
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Disposition": contentDisposition(file.filename),
        "Content-Length": String(body.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  }

  if (!isRemoteBlobConfigured()) {
    return NextResponse.json(
      { error: "Attachment file is not available" },
      { status: 404 },
    );
  }

  const { url: presignedUrl, expiresAt } = await getRemoteDownloadUrl(
    file.pathname,
  );
  await logDownload(expiresAt);

  const response = NextResponse.redirect(presignedUrl, 302);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
