import { z } from "zod";
import type { caseNotes, cases } from "@/db/schema";

export const caseStatusSchema = z.enum([
  "new",
  "in_progress",
  "blocked",
  "resolved",
]);
export type CaseStatus = z.infer<typeof caseStatusSchema>;

/** @deprecated Use `caseStatusSchema` */
export const caseStatusesSchema = caseStatusSchema;

export const casePrioritySchema = z.enum(["low", "medium", "high"]);
export type CasePriority = z.infer<typeof casePrioritySchema>;

/** @deprecated Use `casePrioritySchema` */
export const casePrioritiesSchema = casePrioritySchema;

export const caseSchema = z.object({
  id: z.uuid(),
  caseNumber: z.string().nullable(),
  title: z.string().min(1),
  clientId: z.uuid().nullable(),
  description: z.string().nullable(),
  status: caseStatusSchema,
  priority: casePrioritySchema.nullable(),
  incidentDate: z.string().nullable(),
  incidentTime: z.string().nullable(),
  assignedTo: z.string().nullable(),
  createdBy: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<typeof cases.$inferSelect>;

export type Case = z.infer<typeof caseSchema>;

/** @deprecated Use `Case` */
export type CaseItem = Case;

export const createCaseSchema = caseSchema
  .omit({
    id: true,
    caseNumber: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    status: caseStatusSchema.optional(),
    priority: casePrioritySchema.optional(),
  }) satisfies z.ZodType<
  Omit<typeof cases.$inferInsert, "id" | "caseNumber" | "createdAt" | "updatedAt">
>;

export type NewCase = z.infer<typeof createCaseSchema>;
export type CreateCaseInput = NewCase;

export const updateCaseSchema = createCaseSchema
  .omit({ createdBy: true })
  .partial();
export type UpdateCaseData = z.infer<typeof updateCaseSchema>;
export type UpdateCaseInput = UpdateCaseData;

export const caseNoteSchema = z.object({
  id: z.uuid(),
  caseId: z.uuid(),
  content: z.string().min(1),
  authorId: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<typeof caseNotes.$inferSelect>;

export type CaseNote = z.infer<typeof caseNoteSchema>;

export const createCaseNoteSchema = caseNoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}) satisfies z.ZodType<
  Omit<typeof caseNotes.$inferInsert, "id" | "createdAt" | "updatedAt">
>;

export type CreateCaseNoteInput = z.infer<typeof createCaseNoteSchema>;

export const updateCaseNoteSchema = createCaseNoteSchema
  .omit({ caseId: true, authorId: true })
  .partial();
export type UpdateCaseNoteInput = z.infer<typeof updateCaseNoteSchema>;

/** UI-only attachment metadata (not stored on `cases` table). */
export const caseAttachmentsSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  lastModified: z.number(),
});
export type CaseAttachment = z.infer<typeof caseAttachmentsSchema>;
