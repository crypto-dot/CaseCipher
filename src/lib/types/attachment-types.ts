import { z } from "zod";
import type { attachments } from "@/db/schema";

export const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_UPLOAD = 10;

export const allowedAttachmentContentTypes = [
  "application/pdf",
  "application/octet-stream",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/plain",
  "video/mp4",
  "video/quicktime",
] as const;

export const attachmentSchema = z.object({
  id: z.uuid(),
  caseId: z.uuid(),
  evidenceId: z.uuid().nullable(),
  pathname: z.string().min(1),
  url: z.string().min(1),
  downloadUrl: z.string().nullable(),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
  sha256: z.string().length(64).nullable(),
  md5: z.string().length(32).nullable(),
  uploadedBy: z.string().min(1),
  uploadedAt: z.string(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<typeof attachments.$inferSelect>;

export type Attachment = z.infer<typeof attachmentSchema>;

export const createAttachmentSchema = attachmentSchema
  .omit({
    id: true,
    uploadedAt: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    evidenceId: z.uuid().nullable().optional(),
    downloadUrl: z.string().nullable().optional(),
    sha256: z.string().length(64).nullable().optional(),
    md5: z.string().length(32).nullable().optional(),
  }) satisfies z.ZodType<
  Omit<
    typeof attachments.$inferInsert,
    "id" | "uploadedAt" | "deletedAt" | "createdAt" | "updatedAt"
  >
>;

export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;

export const attachmentFileMetaSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1),
  size: z.number().int().nonnegative().max(MAX_ATTACHMENT_SIZE_BYTES),
  type: z.string().min(1),
  lastModified: z.number().int().nonnegative(),
  url: z.string().min(1).optional(),
  sha256: z.string().length(64).optional(),
  md5: z.string().length(32).optional(),
});

export type AttachmentFileMeta = z.infer<typeof attachmentFileMetaSchema>;

export function attachmentKey(attachment: AttachmentFileMeta): string {
  return attachment.id ?? `${attachment.name}:${attachment.lastModified}`;
}
