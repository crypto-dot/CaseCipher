import { mockEvidence } from "@/lib/mocks/evidence";
import {
  makeNextNumber,
  readNumberingSettings,
} from "@/lib/numbering-settings";
import {
  type AcquisitionMethod,
  type EvidenceItem,
  type EvidenceMedia,
  type EvidenceStatus,
  type EvidenceType,
  evidenceSchema,
} from "@/lib/types/evidence-types";

const STORAGE_KEY = "casecipher:evidence:v1";

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

function readAll(): EvidenceItem[] {
  if (typeof window === "undefined") return mockEvidence;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse<unknown[]>(raw);
  if (parsed && Array.isArray(parsed) && parsed.length > 0) {
    const items: EvidenceItem[] = [];
    for (const row of parsed) {
      const result = evidenceSchema.safeParse(row);
      if (result.success) items.push(result.data);
    }
    if (items.length > 0) return items;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockEvidence));
  return mockEvidence;
}

function writeAll(items: EvidenceItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function nextEvidenceNumber(items: EvidenceItem[]) {
  const { evidenceNumberingRule } = readNumberingSettings();
  return makeNextNumber(
    evidenceNumberingRule,
    items
      .map((item) => item.evidenceNumber)
      .filter((evidenceNumber): evidenceNumber is string =>
        Boolean(evidenceNumber),
      ),
  );
}

function pseudoHash(seed: string, length: number) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let output = "";
  let cursor = hash >>> 0;
  while (output.length < length) {
    cursor = Math.imul(cursor ^ 0x9e3779b9, 16777619) >>> 0;
    output += cursor.toString(16).padStart(8, "0");
  }
  return output.slice(0, length);
}

export type CreateEvidenceFormInput = {
  caseId: string;
  evidenceNumber?: string;
  dateSeized: string;
  evidenceType: EvidenceType;
  status: EvidenceStatus;
  make?: string;
  model?: string;
  serialNumber?: string;
  storageLocation?: string;
  seizedBy?: string;
  acquisitionMethod: AcquisitionMethod;
  acquisitionTool?: string;
  description?: string;
  media?: EvidenceMedia[];
};

export async function listEvidence(): Promise<EvidenceItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return readAll()
    .slice()
    .sort((a, b) => b.collectedAt.localeCompare(a.collectedAt));
}

export async function createEvidence(
  input: CreateEvidenceFormInput,
): Promise<EvidenceItem> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const items = readAll();
  const t = nowIso();
  const evidenceNumber =
    input.evidenceNumber?.trim() || nextEvidenceNumber(items);
  const label = [input.make, input.model].filter(Boolean).join(" ").trim();
  const seed = `${evidenceNumber}:${input.caseId}:${t}`;

  const item: EvidenceItem = {
    id: crypto.randomUUID(),
    caseId: input.caseId,
    evidenceNumber,
    label: label || evidenceNumber,
    description: input.description?.trim() || null,
    evidenceType: input.evidenceType,
    dateSeized: input.dateSeized || null,
    make: input.make?.trim() || null,
    model: input.model?.trim() || null,
    serialNumber: input.serialNumber?.trim() || null,
    storageLocation: input.storageLocation?.trim() || null,
    seizedBy: input.seizedBy?.trim() || null,
    acquisitionMethod: input.acquisitionMethod,
    acquisitionTool: input.acquisitionTool?.trim() || null,
    media: input.media?.length ? input.media : [],
    collectedAt: input.dateSeized
      ? new Date(`${input.dateSeized}T12:00:00`).toISOString()
      : t,
    collectionLocation: input.storageLocation?.trim() || null,
    hashMd5: pseudoHash(seed, 32),
    hashSha256: pseudoHash(`${seed}:sha256`, 64),
    hashSha512: null,
    currentLocation: input.storageLocation?.trim() || null,
    currentCustodian: null,
    status: input.status,
    createdAt: t,
  };

  writeAll([item, ...items]);
  return item;
}
