import {
  type Case,
  type CaseAttachment,
  type CasePriority,
  type CaseStatus,
  caseSchema,
  caseStatusSchema,
} from "@/lib/types/case-types";
import {
  assigneeIdSchema,
  createMockCases,
  MOCK_CREATED_BY,
} from "@/lib/mocks";

const STORAGE_KEY = "casecipher:cases:v4";

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
  return createMockCases(nowIso());
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
  caseNumber?: string;
  caseName: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  caseType?: string;
  requestor?: string;
  assignedExaminer?: string;
  subjectName?: string;
  department?: string;
  dateReceived?: string;
  dateDue?: string;
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

  const newItem: Case = {
    id: crypto.randomUUID(),
    caseNumber: input.caseNumber?.trim() || makeCaseNumber(items),
    title: input.caseName.trim(),
    clientId: null,
    caseType: input.caseType?.trim() || null,
    requestor: input.requestor?.trim() || null,
    assignedExaminer: input.assignedExaminer?.trim() || null,
    subjectName: input.subjectName?.trim() || null,
    department: input.department?.trim() || null,
    dateReceived: input.dateReceived ?? null,
    dateDue: input.dateDue ?? null,
    description: input.description?.trim() || null,
    status: input.status,
    assignedTo: null,
    priority: input.priority,
    incidentDate: null,
    incidentTime: null,
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
