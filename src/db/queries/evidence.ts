import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  linkAttachmentToEvidence,
  listEvidenceMedia,
} from "@/db/queries/attachments";
import { evidence } from "@/db/schema";
import type {
  CreateEvidenceInput,
  EvidenceItem,
  UpdateEvidenceInput,
} from "@/lib/types/evidence-types";

async function hydrateEvidenceMedia(
  row: typeof evidence.$inferSelect,
): Promise<EvidenceItem> {
  return {
    ...row,
    media: await listEvidenceMedia(row.id),
  };
}

async function linkReferencedMedia(
  evidenceId: string,
  media: CreateEvidenceInput["media"] | UpdateEvidenceInput["media"],
) {
  const mediaWithIds = media?.filter((item) => item.id) ?? [];
  await Promise.all(
    mediaWithIds.map((item) =>
      linkAttachmentToEvidence(item.id as string, evidenceId),
    ),
  );
}

/**
 * List evidence for a case
 */
export async function listEvidenceByCase(
  caseId: string,
): Promise<EvidenceItem[]> {
  const rows = await db
    .select()
    .from(evidence)
    .where(eq(evidence.caseId, caseId))
    .orderBy(desc(evidence.createdAt));

  return Promise.all(rows.map(hydrateEvidenceMedia));
}

/**
 * Get evidence by ID
 */
export async function getEvidenceById(
  id: string,
): Promise<EvidenceItem | null> {
  const result = await db
    .select()
    .from(evidence)
    .where(eq(evidence.id, id))
    .limit(1);

  return result[0] ? hydrateEvidenceMedia(result[0]) : null;
}

/**
 * Create new evidence
 */
export async function createEvidence(
  data: CreateEvidenceInput,
): Promise<EvidenceItem> {
  const { media, ...evidenceData } = data;
  const result = await db
    .insert(evidence)
    .values({ ...evidenceData, media: null })
    .returning();

  await linkReferencedMedia(result[0].id, media);
  return hydrateEvidenceMedia(result[0]);
}

/**
 * Update evidence
 */
export async function updateEvidence(
  id: string,
  data: UpdateEvidenceInput,
): Promise<EvidenceItem | null> {
  const { media, ...evidenceData } = data;
  const result = await db
    .update(evidence)
    .set(media === undefined ? evidenceData : { ...evidenceData, media: null })
    .where(eq(evidence.id, id))
    .returning();

  if (!result[0]) return null;

  await linkReferencedMedia(id, media);
  return hydrateEvidenceMedia(result[0]);
}

/**
 * Delete evidence
 */
export async function deleteEvidence(id: string): Promise<boolean> {
  const result = await db
    .delete(evidence)
    .where(eq(evidence.id, id))
    .returning();
  return result.length > 0;
}
