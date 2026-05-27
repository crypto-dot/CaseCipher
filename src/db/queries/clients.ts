import { eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import type {
  Client,
  NewClient,
  UpdateClientInput,
} from "@/lib/types/client-types";

export interface ListClientsOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * List all clients with optional search
 */
export async function listClients(options: ListClientsOptions = {}) {
  const { search, limit = 100, offset = 0 } = options;

  let query = db.select().from(clients);

  if (search) {
    query = query.where(
      or(
        ilike(clients.name, `%${search}%`),
        ilike(clients.contactEmail, `%${search}%`),
      ),
    ) as typeof query;
  }

  return query.orderBy(clients.name).limit(limit).offset(offset);
}

/**
 * Get a single client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new client
 */
export async function createClient(data: NewClient): Promise<Client> {
  const result = await db.insert(clients).values(data).returning();
  return result[0];
}

/**
 * Update a client
 */
export async function updateClient(
  id: string,
  data: UpdateClientInput,
): Promise<Client | null> {
  const result = await db
    .update(clients)
    .set(data)
    .where(eq(clients.id, id))
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<boolean> {
  const result = await db.delete(clients).where(eq(clients.id, id)).returning();
  return result.length > 0;
}
