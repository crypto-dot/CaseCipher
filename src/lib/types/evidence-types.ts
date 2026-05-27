import { z } from "zod";
import type { evidence } from "@/db/schema";

export const evidenceTypeSchema = z.enum(["physical", "digital", "image"]);
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;

export const evidenceStatusSchema = z.enum(["active", "released", "destroyed"]);
export type EvidenceStatus = z.infer<typeof evidenceStatusSchema>;

const hashMd5Schema = z.string().length(32);
const hashSha256Schema = z.string().length(64);
const hashSha512Schema = z.string().length(128);

export const evidenceSchema = z.object({
  id: z.uuid(),
  caseId: z.uuid(),
  label: z.string().min(1).max(100),
  description: z.string().nullable(),
  evidenceType: z.union([evidenceTypeSchema, z.string().max(50)]).nullable(),
  collectedAt: z.string(),
  collectionLocation: z.string().nullable(),
  hashMd5: hashMd5Schema.nullable(),
  hashSha256: hashSha256Schema.nullable(),
  hashSha512: hashSha512Schema.nullable(),
  currentLocation: z.string().max(255).nullable(),
  currentCustodian: z.uuid().nullable(),
  status: z.union([evidenceStatusSchema, z.string().max(30)]).nullable(),
  createdAt: z.string(),
}) satisfies z.ZodType<typeof evidence.$inferSelect>;

export type EvidenceItem = z.infer<typeof evidenceSchema>;

export const createEvidenceSchema = evidenceSchema
  .omit({
    id: true,
    createdAt: true,
    status: true,
  })
  .extend({
    status: evidenceStatusSchema.optional(),
  }) satisfies z.ZodType<
  Omit<typeof evidence.$inferInsert, "id" | "createdAt">
>;

export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>;

export const updateEvidenceSchema = createEvidenceSchema
  .omit({ caseId: true, collectedAt: true })
  .partial()
  .extend({
    collectedAt: z.string().optional(),
  });
export type UpdateEvidenceInput = z.infer<typeof updateEvidenceSchema>;
