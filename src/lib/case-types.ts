import { z } from "zod";

export const caseStatusesSchema = z.enum([
  "new",
  "in_progress",
  "blocked",
  "resolved",
]);
export type CaseStatus = z.infer<typeof caseStatusesSchema>;

export const casePrioritiesSchema = z.enum(["low", "medium", "high"]);
export type CasePriority = z.infer<typeof casePrioritiesSchema>;

export const caseAttachmentsSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  lastModified: z.number(),
});
export type CaseAttachment = z.infer<typeof caseAttachmentsSchema>;

export const caseItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  client: z.string(),
  description: z.string().optional(),
  status: caseStatusesSchema,
  assignee: z.string(),
  priority: casePrioritiesSchema.optional(),
  incidentDate: z.string().optional(),
  incidentTime: z.string().optional(),
  attachments: caseAttachmentsSchema.array().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CaseItem = z.infer<typeof caseItemSchema>;
