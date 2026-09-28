import type { Client } from "@/lib/types/client-types";

export const MOCK_CLIENTS: Client[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Northwind Logistics",
    contactEmail: null,
    contactPhone: null,
    address: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Contoso Health",
    contactEmail: null,
    contactPhone: null,
    address: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Fabrikam Legal",
    contactEmail: null,
    contactPhone: null,
    address: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Globex Corp",
    contactEmail: null,
    contactPhone: null,
    address: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function getMockClientById(id: string): Client | undefined {
  return MOCK_CLIENTS.find((client) => client.id === id);
}

export function getMockClientNameById(id: string | null): string | null {
  if (!id) return null;
  return getMockClientById(id)?.name ?? null;
}

export function resolveClientName(
  clientId: string | null,
  clients: Array<{ id: string; name: string }> = [],
): string | null {
  if (!clientId) return null;
  return (
    clients.find((client) => client.id === clientId)?.name ??
    getMockClientNameById(clientId)
  );
}
