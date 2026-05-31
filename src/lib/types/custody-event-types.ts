import { z } from "zod";
import type { custodyEvents } from "@/db/schema";

export const custodyEventTypeSchema = z.enum([
  "collected",
  "transferred",
  "analyzed",
  "stored",
  "checked_out",
  "checked_in",
  "court_submitted",
  "released",
]);
export type CustodyEventType = z.infer<typeof custodyEventTypeSchema>;

const rowHashSchema = z.string().length(64);

export const custodyEventSchema = z.object({
  id: z.uuid(),
  evidenceId: z.uuid(),
  eventType: z.union([custodyEventTypeSchema, z.string().max(50)]),
  fromCustodian: z.uuid().nullable(),
  toCustodian: z.uuid().nullable(),
  fromLocation: z.string().max(255).nullable(),
  toLocation: z.string().max(255).nullable(),
  reason: z.string().nullable(),
  notes: z.string().nullable(),
  eventTimestamp: z.string(),
  recordedBy: z.uuid(),
  transferorSignature: z.string().nullable(),
  recipientSignature: z.string().nullable(),
  signatureVerified: z.boolean().nullable(),
  rowHash: rowHashSchema.nullable(),
}) satisfies z.ZodType<typeof custodyEvents.$inferSelect>;

export type CustodyEventItem = z.infer<typeof custodyEventSchema>;

export const createCustodyEventSchema = custodyEventSchema
  .omit({
    id: true,
    eventTimestamp: true,
    signatureVerified: true,
    rowHash: true,
  })
  .extend({
    eventTimestamp: z.string().optional(),
    signatureVerified: z.boolean().optional(),
    rowHash: rowHashSchema.optional(),
  }) satisfies z.ZodType<Omit<typeof custodyEvents.$inferInsert, "id">>;

export type CreateCustodyEventInput = z.infer<typeof createCustodyEventSchema>;

export const updateCustodyEventSchema = createCustodyEventSchema
  .omit({
    evidenceId: true,
    recordedBy: true,
  })
  .partial();
export type UpdateCustodyEventInput = z.infer<typeof updateCustodyEventSchema>;
