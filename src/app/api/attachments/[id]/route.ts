import { NextResponse } from "next/server";
import { getAttachmentById } from "@/db/queries/attachments";
import {
  hasLocalAttachment,
  readLocalAttachment,
} from "@/lib/attachment-storage";
import { requireUser } from "@/lib/auth/session";

function contentDisposition(filename: string) {
  const ascii = filename.replace(/[^\x20-\x7E]+/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireUser();
  const { id } = await context.params;
  const attachment = await getAttachmentById(id);

  if (!attachment) {
    return NextResponse.json(
      { error: "Attachment not found" },
      { status: 404 },
    );
  }

  if (!(await hasLocalAttachment(attachment.pathname))) {
    return NextResponse.json(
      { error: "Attachment file is not available" },
      { status: 404 },
    );
  }

  const body = await readLocalAttachment(attachment.pathname);

  return new NextResponse(Uint8Array.from(body), {
    headers: {
      "Content-Type": attachment.contentType || "application/octet-stream",
      "Content-Disposition": contentDisposition(attachment.filename),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
