"use server";

import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/db/queries/audit";
import {
  createClient as dbCreateClient,
  deleteClient as dbDeleteClient,
  getClientById as dbGetClientById,
  listClients as dbListClients,
  updateClient as dbUpdateClient,
  type ListClientsOptions,
} from "@/db/queries/clients";
import type { clients } from "@/db/schema";

export interface CreateClientInput {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientInput {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  notes?: string;
}

/**
 * List clients with optional search
 */
export async function listClients(options?: ListClientsOptions) {
  return dbListClients(options);
}

/**
 * Get a single client by ID
 */
export async function getClientById(id: string) {
  return dbGetClientById(id);
}

/**
 * Create a new client
 */
export async function createClient(
  input: CreateClientInput,
  user: { id: string; email: string; name?: string },
) {
  const newClient: typeof clients.$inferInsert = {
    id: crypto.randomUUID(),
    name: input.name,
    contactEmail: input.contactEmail || null,
    contactPhone: input.contactPhone || null,
    address: input.address || null,
    notes: input.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = await dbCreateClient(newClient);

  // Log the action
  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "client.created",
    entityType: "client",
    entityId: created.id,
    changes: { after: created },
  });

  revalidatePath("/dashboard/clients");

  return created;
}

/**
 * Update a client
 */
export async function updateClient(
  id: string,
  input: UpdateClientInput,
  user: { id: string; email: string; name?: string },
) {
  const before = await dbGetClientById(id);
  if (!before) {
    throw new Error("Client not found");
  }

  const updated = await dbUpdateClient(id, input);
  if (!updated) {
    throw new Error("Failed to update client");
  }

  // Log the action
  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "client.updated",
    entityType: "client",
    entityId: id,
    changes: { before, after: updated },
  });

  revalidatePath("/dashboard/clients");

  return updated;
}

/**
 * Delete a client
 */
export async function deleteClient(
  id: string,
  user: { id: string; email: string; name?: string },
) {
  const before = await dbGetClientById(id);
  if (!before) {
    throw new Error("Client not found");
  }

  const deleted = await dbDeleteClient(id);
  if (!deleted) {
    throw new Error("Failed to delete client");
  }

  // Log the action
  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "client.deleted",
    entityType: "client",
    entityId: id,
    changes: { before },
  });

  revalidatePath("/dashboard/clients");

  return true;
}
