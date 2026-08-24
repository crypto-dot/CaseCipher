import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import {
  type Attachment,
  type AttachmentFileMeta,
  type CreateAttachmentInput,
  createAttachmentSchema,
} from "@/lib/types/attachment-types";

export type AttachmentsByCase = Record<string, Attachment[]>;
export type NewAttachment = typeof attachments.$inferInsert;
export type UpdateAttachmentData = Partial<
  Omit<NewAttachment, "createdAt" | "id">
>;

export interface ListAttachmentsOptions {
  caseId?: string;
  evidenceId?: string;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

function activeAttachmentFilter(includeDeleted = false) {
  return includeDeleted ? undefined : isNull(attachments.deletedAt);
}

function toAttachmentMedia(attachment: Attachment): AttachmentFileMeta {
  return {
    id: attachment.id,
    name: attachment.filename,
    size: attachment.size,
    type: attachment.contentType,
    lastModified: Date.parse(attachment.uploadedAt),
    url: attachment.url,
    sha256: attachment.sha256 ?? undefined,
    md5: attachment.md5 ?? undefined,
  };
}

export async function listAttachments(
  options: ListAttachmentsOptions = {},
): Promise<Attachment[]> {
  const conditions = [];
  const { includeDeleted = false, limit = 50, offset = 0 } = options;

  if (options.caseId) {
    conditions.push(eq(attachments.caseId, options.caseId));
  }

  if (options.evidenceId) {
    conditions.push(eq(attachments.evidenceId, options.evidenceId));
  }

  const activeFilter = activeAttachmentFilter(includeDeleted);
  if (activeFilter) {
    conditions.push(activeFilter);
  }

  return db
    .select()
    .from(attachments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(attachments.uploadedAt))
    .limit(limit)
    .offset(offset);
}

export async function listCaseAttachments(
  caseId: string,
): Promise<Attachment[]> {
  return listAttachments({ caseId });
}

export async function listAllCaseAttachments(): Promise<AttachmentsByCase> {
  const rows = await listAttachments({ limit: 1000 });

  return rows.reduce<AttachmentsByCase>((acc, attachment) => {
    acc[attachment.caseId] ??= [];
    acc[attachment.caseId].push(attachment);
    return acc;
  }, {});
}

export async function listEvidenceAttachments(evidenceId: string) {
  return listAttachments({ evidenceId });
}

export async function listEvidenceMedia(
  evidenceId: string,
): Promise<AttachmentFileMeta[]> {
  const rows = await listEvidenceAttachments(evidenceId);
  return rows.map(toAttachmentMedia);
}

export async function getAttachmentById(
  id: string,
  options: Pick<ListAttachmentsOptions, "includeDeleted"> = {},
): Promise<Attachment | null> {
  const activeFilter = activeAttachmentFilter(options.includeDeleted);
  const result = await db
    .select()
    .from(attachments)
    .where(
      activeFilter
        ? and(eq(attachments.id, id), activeFilter)
        : eq(attachments.id, id),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function getCaseAttachment(id: string) {
  return getAttachmentById(id);
}

export async function getAttachmentByPathname(
  pathname: string,
  options: Pick<ListAttachmentsOptions, "includeDeleted"> = {},
): Promise<Attachment | null> {
  const activeFilter = activeAttachmentFilter(options.includeDeleted);
  const result = await db
    .select()
    .from(attachments)
    .where(
      activeFilter
        ? and(eq(attachments.pathname, pathname), activeFilter)
        : eq(attachments.pathname, pathname),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function createAttachment(
  data: CreateAttachmentInput,
): Promise<Attachment> {
  const input = createAttachmentSchema.parse(data);
  const result = await db.insert(attachments).values(input).returning();
  return result[0];
}

export async function createCaseAttachment(data: CreateAttachmentInput) {
  return createAttachment(data);
}

export async function createAttachments(
  rows: CreateAttachmentInput[],
): Promise<Attachment[]> {
  if (rows.length === 0) return [];

  const input = rows.map((row) => createAttachmentSchema.parse(row));
  return db.insert(attachments).values(input).returning();
}

export async function updateAttachment(
  id: string,
  data: UpdateAttachmentData,
): Promise<Attachment | null> {
  const result = await db
    .update(attachments)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(attachments.id, id))
    .returning();

  return result[0] ?? null;
}

export async function softDeleteAttachment(
  id: string,
  deletedAt = new Date().toISOString(),
): Promise<Attachment | null> {
  const result = await db
    .update(attachments)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(eq(attachments.id, id))
    .returning();

  return result[0] ?? null;
}

export async function softDeleteCaseAttachment(id: string) {
  return softDeleteAttachment(id);
}

export async function linkAttachmentToEvidence(
  attachmentId: string,
  evidenceId: string,
): Promise<Attachment | null> {
  const result = await db
    .update(attachments)
    .set({
      evidenceId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(attachments.id, attachmentId))
    .returning();

  return result[0] ?? null;
}

export async function deleteAttachment(id: string): Promise<boolean> {
  const result = await db
    .delete(attachments)
    .where(eq(attachments.id, id))
    .returning();

  return result.length > 0;
}
