import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { caseNotes, cases, clients, evidence } from "@/db/schema";
import type {
  Case,
  CasePriority,
  CaseStatus,
  NewCase,
  UpdateCaseData,
} from "@/lib/types/case-types";

export type { Case, NewCase, UpdateCaseData } from "@/lib/types/case-types";

export interface ListCasesOptions {
  userId?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  clientId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * List cases with optional filters
 */
export async function listCases(options: ListCasesOptions = {}) {
  const {
    status,
    priority,
    clientId,
    search,
    limit = 50,
    offset = 0,
  } = options;

  const conditions = [];

  if (status) {
    conditions.push(eq(cases.status, status));
  }

  if (priority) {
    conditions.push(eq(cases.priority, priority));
  }

  if (clientId) {
    conditions.push(eq(cases.clientId, clientId));
  }

  if (search) {
    conditions.push(
      or(
        ilike(cases.title, `%${search}%`),
        ilike(cases.caseNumber, `%${search}%`),
        ilike(cases.description, `%${search}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select({
      case: cases,
      client: clients,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(whereClause)
    .orderBy(desc(cases.updatedAt))
    .limit(limit)
    .offset(offset);

  return result.map((row) => ({
    ...row.case,
    client: row.client,
  }));
}

/**
 * Get a single case by ID with relations
 */
export async function getCaseById(id: string) {
  const result = await db
    .select({
      case: cases,
      client: clients,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(eq(cases.id, id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const caseData = result[0];

  // Get evidence for the case
  const caseEvidence = await db
    .select()
    .from(evidence)
    .where(eq(evidence.caseId, id))
    .orderBy(desc(evidence.createdAt));

  // Get notes for the case
  const notes = await db
    .select()
    .from(caseNotes)
    .where(eq(caseNotes.caseId, id))
    .orderBy(desc(caseNotes.createdAt));

  return {
    ...caseData.case,
    client: caseData.client,
    evidence: caseEvidence,
    notes,
  };
}

/**
 * Get a case by case number
 */
export async function getCaseByCaseNumber(caseNumber: string) {
  const result = await db
    .select()
    .from(cases)
    .where(eq(cases.caseNumber, caseNumber))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Generate next case number
 */
export async function generateCaseNumber(): Promise<string> {
  const result = await db
    .select({ caseNumber: cases.caseNumber })
    .from(cases)
    .orderBy(desc(cases.createdAt))
    .limit(1);

  if (result.length === 0) {
    return "CASE-1001";
  }

  const lastNumber = result[0].caseNumber;
  if (!lastNumber) {
    return "CASE-1001";
  }

  const match = lastNumber.match(/CASE-(\d+)/);

  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `CASE-${nextNum}`;
  }

  return `CASE-${Date.now()}`;
}

/**
 * Create a new case
 */
export async function createCase(data: NewCase): Promise<Case> {
  const caseNumber = await generateCaseNumber();

  const result = await db
    .insert(cases)
    .values({
      ...data,
      caseNumber,
    })
    .returning();

  return result[0];
}

/**
 * Update a case
 */
export async function updateCase(
  id: string,
  data: UpdateCaseData,
): Promise<Case | null> {
  const result = await db
    .update(cases)
    .set(data)
    .where(eq(cases.id, id))
    .returning();

  return result[0] ?? null;
}

/**
 * Update case status
 */
export async function updateCaseStatus(
  id: string,
  status: CaseStatus,
): Promise<Case | null> {
  return updateCase(id, { status });
}

/**
 * Assign case to user
 */
export async function assignCase(
  id: string,
  assignedTo: string | null,
): Promise<Case | null> {
  return updateCase(id, { assignedTo });
}

/**
 * Delete a case
 */
export async function deleteCase(id: string): Promise<boolean> {
  const result = await db.delete(cases).where(eq(cases.id, id)).returning();
  return result.length > 0;
}

/**
 * Get case statistics
 */
export async function getCaseStats() {
  const stats = await db
    .select({
      status: cases.status,
      count: sql<number>`count(*)::int`,
    })
    .from(cases)
    .groupBy(cases.status);

  const byStatus: Record<CaseStatus, number> = {
    new_case: 0,
    intake: 0,
    processing: 0,
    investigation: 0,
    report: 0,
    review: 0,
  };

  for (const row of stats) {
    byStatus[row.status] = row.count;
  }

  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

  return {
    total,
    byStatus,
  };
}
