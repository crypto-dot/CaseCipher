import { z } from "zod";
import type { clients } from "@/db/schema";

export const clientSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  contactEmail: z.email().nullable(),
  contactPhone: z.string().nullable(),
  address: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<typeof clients.$inferSelect>;

export type Client = z.infer<typeof clientSchema>;

export const createClientSchema = clientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}) satisfies z.ZodType<
  Omit<typeof clients.$inferInsert, "id" | "createdAt" | "updatedAt">
>;

export type NewClient = z.infer<typeof createClientSchema>;

export const updateClientSchema = createClientSchema.partial();
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
