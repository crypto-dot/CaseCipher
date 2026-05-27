import { z } from "zod";
import type { auditLog } from "@/db/schema";

export const auditLogSchema = z.object({
  id: z.uuid(),
  userId: z.string().min(1),
  userEmail: z.email(),
  userName: z.string().nullable(),
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.uuid().nullable(),
  changes: z.unknown().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
}) satisfies z.ZodType<typeof auditLog.$inferSelect>;

export type AuditLogEntry = z.infer<typeof auditLogSchema>;

export const createAuditLogSchema = z.object({
  userId: z.string().min(1),
  userEmail: z.email(),
  userName: z.string().nullable().optional(),
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.uuid().nullable().optional(),
  changes: z.unknown().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
}) satisfies z.ZodType<Omit<typeof auditLog.$inferInsert, "id" | "createdAt">>;

export type NewAuditLogEntry = z.infer<typeof createAuditLogSchema>;
