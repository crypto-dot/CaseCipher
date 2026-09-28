import { z } from "zod";
import type { personnel } from "@/db/schema";
import { userRoleSchema } from "@/lib/types/user-types";

export const personnelSchema = z.object({
  userId: z.uuid(),
  badgeNumber: z.string().nullable(),
  role: userRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<typeof personnel.$inferSelect>;

export type PersonnelItem = z.infer<typeof personnelSchema>;

export const createPersonnelSchema = personnelSchema.omit({
  createdAt: true,
  updatedAt: true,
}) satisfies z.ZodType<
  Omit<typeof personnel.$inferInsert, "createdAt" | "updatedAt">
>;

export type CreatePersonnelInput = z.infer<typeof createPersonnelSchema>;

export const updatePersonnelSchema = createPersonnelSchema
  .omit({ userId: true })
  .partial();
export type UpdatePersonnelInput = z.infer<typeof updatePersonnelSchema>;
