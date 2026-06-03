import { z } from "zod";
import type { evidence } from "@/db/schema";

export const evidenceTypeSchema = z.enum([
  "hard_drive",
  "desktop",
  "mobile_device",
  "tablet",
  "memory_dump",
  "network_capture",
  "laptop",
  "other",
]);
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;

export const evidenceStatusSchema = z.enum([
  "received",
  "under_examination",
  "in_queue",
  "analysis_complete",
  "returned",
]);
export type EvidenceStatus = z.infer<typeof evidenceStatusSchema>;

export const acquisitionMethodSchema = z.enum([
  "physical",
  "logical",
  "remote",
  "chip_off",
  "file_export",
  "other",
]);
export type AcquisitionMethod = z.infer<typeof acquisitionMethodSchema>;

const hashMd5Schema = z.string().length(32);
const hashSha256Schema = z.string().length(64);
const hashSha512Schema = z.string().length(128);

export const evidenceMediaSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  lastModified: z.number(),
});
export type EvidenceMedia = z.infer<typeof evidenceMediaSchema>;

export const evidenceSchema = z.object({
  id: z.uuid(),
  caseId: z.uuid(),
  evidenceNumber: z.string().max(50).nullable(),
  label: z.string().min(1).max(100),
  description: z.string().nullable(),
  evidenceType: z.union([evidenceTypeSchema, z.string().max(50)]).nullable(),
  dateSeized: z.string().nullable(),
  make: z.string().max(100).nullable(),
  model: z.string().max(100).nullable(),
  serialNumber: z.string().max(120).nullable(),
  storageLocation: z.string().max(255).nullable(),
  seizedBy: z.string().max(120).nullable(),
  acquisitionMethod: z
    .union([acquisitionMethodSchema, z.string().max(50)])
    .nullable(),
  acquisitionTool: z.string().max(120).nullable(),
  media: z.array(evidenceMediaSchema).nullable(),
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
    hashMd5: true,
    hashSha256: true,
    hashSha512: true,
  })
  .extend({
    status: evidenceStatusSchema.optional(),
    hashMd5: hashMd5Schema.optional(),
    hashSha256: hashSha256Schema.optional(),
    hashSha512: hashSha512Schema.optional(),
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
