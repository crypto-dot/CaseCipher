"use server";

import { revalidatePath } from "next/cache";
import { logCaseAction } from "@/db/queries/audit";
import {
  assignCase as dbAssignCase,
  createCase as dbCreateCase,
  deleteCase as dbDeleteCase,
  getCaseById as dbGetCaseById,
  getCaseStats as dbGetCaseStats,
  listCases as dbListCases,
  updateCase as dbUpdateCase,
  updateCaseStatus as dbUpdateCaseStatus,
  type ListCasesOptions,
} from "@/db/queries/cases";
import {
  type CaseStatus,
  type CreateCaseInput,
  createCaseSchema,
  type UpdateCaseInput,
  updateCaseSchema,
} from "@/lib/case-types";

export type { CreateCaseInput, UpdateCaseInput } from "@/lib/case-types";

/**
 * List cases with filters
 */
export async function listCases(options?: ListCasesOptions) {
  return dbListCases(options);
}

/**
 * Get a single case by ID
 */
export async function getCaseById(id: string) {
  return dbGetCaseById(id);
}

/**
 * Get case statistics
 */
export async function getCaseStats() {
  return dbGetCaseStats();
}

/**
 * Create a new case
 */
export async function createCase(
  input: CreateCaseInput,
  user: { id: string; email: string; name?: string },
) {
  const newCase = createCaseSchema.parse({
    ...input,
    clientId: input.clientId ?? null,
    description: input.description ?? null,
    status: input.status ?? "new",
    priority: input.priority ?? "medium",
    incidentDate: input.incidentDate ?? null,
    incidentTime: input.incidentTime ?? null,
    assignedTo: input.assignedTo ?? null,
    createdBy: user.id,
  });

  const created = await dbCreateCase(newCase);

  // Log the action
  await logCaseAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "created",
    caseId: created.id,
    changes: { after: created },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cases");

  return created;
}

/**
 * Update a case
 */
export async function updateCase(
  id: string,
  input: UpdateCaseInput,
  user: { id: string; email: string; name?: string },
) {
  const before = await dbGetCaseById(id);
  if (!before) {
    throw new Error("Case not found");
  }

  const updated = await dbUpdateCase(id, updateCaseSchema.parse(input));
  if (!updated) {
    throw new Error("Failed to update case");
  }

  // Log the action
  await logCaseAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "updated",
    caseId: id,
    changes: { before, after: updated },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cases");
  revalidatePath(`/dashboard/cases/${id}`);

  return updated;
}

/**
 * Update case status
 */
export async function updateCaseStatus(
  id: string,
  status: CaseStatus,
  user: { id: string; email: string; name?: string },
) {
  const before = await dbGetCaseById(id);
  if (!before) {
    throw new Error("Case not found");
  }

  const updated = await dbUpdateCaseStatus(id, status);
  if (!updated) {
    throw new Error("Failed to update case status");
  }

  // Log the action
  await logCaseAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "status_changed",
    caseId: id,
    changes: { before: { status: before.status }, after: { status } },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cases");

  return updated;
}

/**
 * Assign case to user
 */
export async function assignCase(
  id: string,
  assignedTo: string | null,
  user: { id: string; email: string; name?: string },
) {
  const before = await dbGetCaseById(id);
  if (!before) {
    throw new Error("Case not found");
  }

  const updated = await dbAssignCase(id, assignedTo);
  if (!updated) {
    throw new Error("Failed to assign case");
  }

  // Log the action
  await logCaseAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "assigned",
    caseId: id,
    changes: {
      before: { assignedTo: before.assignedTo },
      after: { assignedTo },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cases");

  return updated;
}

/**
 * Delete a case
 */
export async function deleteCase(
  id: string,
  user: { id: string; email: string; name?: string },
) {
  const before = await dbGetCaseById(id);
  if (!before) {
    throw new Error("Case not found");
  }

  const deleted = await dbDeleteCase(id);
  if (!deleted) {
    throw new Error("Failed to delete case");
  }

  // Log the action
  await logCaseAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "deleted",
    caseId: id,
    changes: { before },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cases");

  return true;
}
