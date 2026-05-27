import {
  type Case,
  type CaseAttachment,
  type CaseStatus,
  caseSchema,
  caseStatusSchema,
  type CreateCaseInput,
} from "@/lib/types/case-types";
import { assigneeIdSchema } from "@/lib/mocks";

const STORAGE_KEY = "casecipher:cases:v1";
const MOCK_CREATED_BY = "mock-user";

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

function seedCases(): Case[] {
  const t = nowIso();
  return [
    {
      id: "00000000-0000-4000-8000-000000000001",
      caseNumber: "CASE-1001",
      title: "Intake: Missing documentation",
      clientId: null,
      description: "Client: Northwind Logistics. Collect signed authorization and verify incident date.",
      status: "new",
      priority: "medium",
      incidentDate: null,
      incidentTime: null,
      assignedTo: "1",
      createdBy: MOCK_CREATED_BY,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      caseNumber: "CASE-1002",
      title: "Review: Evidence packet",
      clientId: null,
      description: "Client: Contoso Health. Confirm chain-of-custody and mark sensitive attachments.",
      status: "in_progress",
      priority: "medium",
      incidentDate: null,
      incidentTime: null,
      assignedTo: "3",
      createdBy: MOCK_CREATED_BY,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      caseNumber: "CASE-1003",
      title: "Client follow-up: Signature mismatch",
      clientId: null,
      description: "Client: Fabrikam Legal. Escalate to client rep and request re-sign within 48h.",
      status: "blocked",
      priority: "medium",
      incidentDate: null,
      incidentTime: null,
      assignedTo: "2",
      createdBy: MOCK_CREATED_BY,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "00000000-0000-4000-8000-000000000004",
      caseNumber: "CASE-1004",
      title: "Closeout: Final report",
      clientId: null,
      description: "Client: Globex Corp. Export report PDF and notify stakeholders.",
      status: "resolved",
      priority: "medium",
      incidentDate: null,
      incidentTime: null,
      assignedTo: "4",
      createdBy: MOCK_CREATED_BY,
      createdAt: t,
      updatedAt: t,
    },
  ];
}

function readAll(): Case[] {
  if (typeof window === "undefined") return seedCases();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse<unknown[]>(raw);
  if (parsed && Array.isArray(parsed) && parsed.length > 0) {
    const cases: Case[] = [];
    for (const row of parsed) {
      const result = caseSchema.safeParse(row);
      if (result.success) cases.push(result.data);
    }
    if (cases.length > 0) return cases;
  }
  const seeded = seedCases();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeAll(items: Case[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function listCases(): Promise<Case[]> {
  await new Promise((r) => setTimeout(r, 150));
  return readAll()
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Form-friendly create input (maps to DB `CreateCaseInput` in `createCase`). */
export type CreateCaseFormInput = {
  title: string;
  client: string;
  description?: string;
  status: CaseStatus;
  assignedTo: string;
  priority?: CreateCaseInput["priority"];
  incidentDate?: string;
  incidentTime?: string;
  attachments?: CaseAttachment[];
};

function makeCaseNumber(existing: Case[]) {
  const numeric = existing
    .map((c) => c.caseNumber && /^CASE-(\d+)$/i.exec(c.caseNumber)?.[1])
    .map((m) => (m ? Number.parseInt(m, 10) : Number.NaN))
    .filter((n) => Number.isFinite(n));
  const next = (numeric.length ? Math.max(...numeric) : 1000) + 1;
  return `CASE-${next}`;
}

export async function createCase(input: CreateCaseFormInput): Promise<Case> {
  await new Promise((r) => setTimeout(r, 250));
  const items = readAll();
  const t = nowIso();
  const description = [
    input.client.trim() ? `Client: ${input.client.trim()}.` : "",
    input.description?.trim() ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const newItem: Case = {
    id: crypto.randomUUID(),
    caseNumber: makeCaseNumber(items),
    title: input.title.trim(),
    clientId: null,
    description: description || null,
    status: input.status,
    assignedTo: input.assignedTo || null,
    priority: input.priority ?? "medium",
    incidentDate: input.incidentDate ?? null,
    incidentTime: input.incidentTime ?? null,
    createdBy: MOCK_CREATED_BY,
    createdAt: t,
    updatedAt: t,
  };
  writeAll([newItem, ...items]);
  return newItem;
}

export async function updateCaseStatus(params: {
  id: string;
  status: string;
}): Promise<Case> {
  await new Promise((r) => setTimeout(r, 200));
  const items = readAll();
  const idx = items.findIndex((c) => c.id === params.id);
  if (idx < 0) throw new Error("Case not found");
  const parsed = caseStatusSchema.safeParse(params.status);
  const status = parsed.success ? parsed.data : items[idx].status;
  const updated: Case = {
    ...items[idx],
    status,
    updatedAt: nowIso(),
  };
  const next = items.slice();
  next[idx] = updated;
  writeAll(next);
  return updated;
}

export async function reassignCase(params: {
  id: string;
  assignedTo: string;
}): Promise<Case> {
  await new Promise((r) => setTimeout(r, 200));
  const items = readAll();
  const idx = items.findIndex((c) => c.id === params.id);
  if (idx < 0) throw new Error("Case not found");
  const parsed = assigneeIdSchema.safeParse(params.assignedTo);
  const assignedTo = parsed.success ? parsed.data : items[idx].assignedTo;
  const updated: Case = {
    ...items[idx],
    assignedTo,
    updatedAt: nowIso(),
  };
  const next = items.slice();
  next[idx] = updated;
  writeAll(next);
  return updated;
}
