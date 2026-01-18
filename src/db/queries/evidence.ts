import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { type Evidence, evidence, type NewEvidence } from "@/db/schema";

/**
 * List evidence for a case
 */
export async function listEvidenceByCase(caseId: string) {
  return db
    .select()
    .from(evidence)
    .where(eq(evidence.caseId, caseId))
    .orderBy(desc(evidence.createdAt));
}

/**
 * Get evidence by ID
 */
export async function getEvidenceById(id: string): Promise<Evidence | null> {
  const result = await db
    .select()
    .from(evidence)
    .where(eq(evidence.id, id))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create new evidence
 */
export async function createEvidence(data: NewEvidence): Promise<Evidence> {
  const result = await db.insert(evidence).values(data).returning();
  return result[0];
}

/**
 * Update evidence
 */
export async function updateEvidence(
  id: string,
  data: Partial<Omit<Evidence, "id" | "caseId" | "uploadedBy" | "createdAt">>,
): Promise<Evidence | null> {
  const result = await db
    .update(evidence)
    .set(data)
    .where(eq(evidence.id, id))
    .returning();

  return result[0] ?? null;
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
