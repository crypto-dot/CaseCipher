import { z } from "zod";
import type { personnel } from "@/db/schema";

export const personnelRoleSchema = z.enum([
  "detective",
  "forensic_analyst",
  "supervisor",
]);
export type PersonnelRole = z.infer<typeof personnelRoleSchema>;

export const personnelSchema = z.object({
  id: z.uuid(),
  fullName: z.string().min(1).max(150),
  badgeOrEmployeeId: z.string().max(50).nullable(),
  organization: z.string().max(100).nullable(),
  role: z.union([personnelRoleSchema, z.string().max(50)]).nullable(),
  email: z.string().max(150).email().nullable(),
  isActive: z.boolean().nullable(),
}) satisfies z.ZodType<typeof personnel.$inferSelect>;

export type PersonnelItem = z.infer<typeof personnelSchema>;

export const createPersonnelSchema = personnelSchema
  .omit({ id: true, isActive: true })
  .extend({
    isActive: z.boolean().optional(),
  }) satisfies z.ZodType<Omit<typeof personnel.$inferInsert, "id">>;

export type CreatePersonnelInput = z.infer<typeof createPersonnelSchema>;

export const updatePersonnelSchema = createPersonnelSchema.partial();
export type UpdatePersonnelInput = z.infer<typeof updatePersonnelSchema>;
