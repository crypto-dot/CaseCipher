import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  type AuditLogEntry,
  auditLog,
  type NewAuditLogEntry,
} from "@/db/schema";

export interface ListAuditLogsOptions {
  userId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * List audit log entries with filters
 */
export async function listAuditLogs(options: ListAuditLogsOptions = {}) {
  const {
    userId,
    entityType,
    entityId,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = options;

  const conditions = [];

  if (userId) {
    conditions.push(eq(auditLog.userId, userId));
  }

  if (entityType) {
    conditions.push(eq(auditLog.entityType, entityType));
  }

  if (entityId) {
    conditions.push(eq(auditLog.entityId, entityId));
  }

  if (startDate) {
    conditions.push(gte(auditLog.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(auditLog.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(auditLog)
    .where(whereClause)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsForEntity(
  entityType: string,
  entityId: string,
) {
  return db
    .select()
    .from(auditLog)
    .where(
      and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)),
    )
    .orderBy(desc(auditLog.createdAt));
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  data: NewAuditLogEntry,
): Promise<AuditLogEntry> {
  const result = await db.insert(auditLog).values(data).returning();
  return result[0];
}

/**
 * Helper to create audit log for case actions
 */
export async function logCaseAction(params: {
  userId: string;
  userEmail: string;
  userName?: string;
  action: string;
  caseId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return createAuditLog({
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    action: `case.${params.action}`,
    entityType: "case",
    entityId: params.caseId,
    changes: params.changes,
    ipAddress: params.ipAddress,
  });
}

/**
 * Helper to create audit log for evidence actions
 */
export async function logEvidenceAction(params: {
  userId: string;
  userEmail: string;
  userName?: string;
  action: string;
  evidenceId: string;
  caseId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return createAuditLog({
    userId: params.userId,
    userEmail: params.userEmail,
    userName: params.userName,
    action: `evidence.${params.action}`,
    entityType: "evidence",
    entityId: params.evidenceId,
    changes: { ...params.changes, caseId: params.caseId },
    ipAddress: params.ipAddress,
  });
}
