import { type CaseAttachment, type CaseItem, type CasePriority, type CaseStatus, type TeamMember, teamMembersSchema } from "@/lib/case-types";
import {z} from "zod";
const STORAGE_KEY = "casecipher:cases:v1";

function nowIso() {
  return new Date().toISOString();
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function seedCases(): CaseItem[] {
  const t = nowIso();
  return [
    {
      id: "CASE-1001",
      title: "Intake: Missing documentation",
      client: "Northwind Logistics",
      description: "Collect signed authorization and verify incident date.",
      status: "new",
      assignee: "Alex",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "CASE-1002",
      title: "Review: Evidence packet",
      client: "Contoso Health",
      description: "Confirm chain-of-custody and mark sensitive attachments.",
      status: "in_progress",
      assignee: "Sam",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "CASE-1003",
      title: "Client follow-up: Signature mismatch",
      client: "Fabrikam Legal",
      description: "Escalate to client rep and request re-sign within 48h.",
      status: "blocked",
      assignee: "Jordan",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "CASE-1004",
      title: "Closeout: Final report",
      client: "Globex Corp",
      description: "Export report PDF and notify stakeholders.",
      status: "resolved",
      assignee: "Taylor",
      createdAt: t,
      updatedAt: t,
    },
  ];
}

function readAll(): CaseItem[] {
  if (typeof window === "undefined") return seedCases();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse<CaseItem[]>(raw);
  if (parsed && Array.isArray(parsed) && parsed.length > 0) return parsed;
  const seeded = seedCases();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeAll(items: CaseItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function listCases(): Promise<CaseItem[]> {
  // Simulate network latency for React Query UX.
  await new Promise((r) => setTimeout(r, 150));
  return readAll().slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export type CreateCaseInput = {
  title: string;
  client: string;
  description?: string;
  status: CaseStatus;
  assignee: string;
  priority?: CasePriority;
  incidentDate?: string;
  incidentTime?: string;
  attachments?: CaseAttachment[];
};

function makeId(existing: CaseItem[]) {
  const numeric = existing
    .map((c) => Number.parseInt(c.id.replace("CASE-", ""), 10))
    .filter((n) => Number.isFinite(n));
  const next = (numeric.length ? Math.max(...numeric) : 1000) + 1;
  return `CASE-${next}`;
}

export async function createCase(input: CreateCaseInput): Promise<CaseItem> {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();
  const t = nowIso();
  const newItem: CaseItem = {
    id: makeId(items),
    title: input.title.trim(),
    client: input.client.trim(),
    description: input.description?.trim() || undefined,
    status: input.status,
    assignee: input.assignee,
    priority: input.priority,
    incidentDate: input.incidentDate,
    incidentTime: input.incidentTime,
    attachments: input.attachments?.length ? input.attachments : undefined,
    createdAt: t,
    updatedAt: t,
  };
  writeAll([newItem, ...items]);
  return newItem;
}

export async function updateCaseStatus(params: {
  id: string;
  status: CaseStatus;
}): Promise<CaseItem> {
  await new Promise((r) => setTimeout(r, 200));
  const items = readAll();
  const idx = items.findIndex((c) => c.id === params.id);
  if (idx < 0) throw new Error("Case not found");
  const updated: CaseItem = {
    ...items[idx],
    status: params.status,
    updatedAt: nowIso(),
  };
  const next = items.slice();
  next[idx] = updated;
  writeAll(next);
  return updated;
}

export async function reassignCase(params: {
  id: string;
  assignee: string;
}): Promise<CaseItem> {
  await new Promise((r) => setTimeout(r, 200));
  const items = readAll();
  const idx = items.findIndex((c) => c.id === params.id);
  if (idx < 0) throw new Error("Case not found");
  const assignee = teamMembersSchema.safeParse(params.assignee).success
    ? params.assignee
    : items[idx].assignee;
  const updated: CaseItem = {
    ...items[idx],
    assignee,
    updatedAt: nowIso(),
  };
  const next = items.slice();
  next[idx] = updated;
  writeAll(next);
  return updated;
}


