import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "manager", "analyst", "examiner"]);
export type UserRole = "admin" | "manager" | "analyst" | "examiner";