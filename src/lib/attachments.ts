import { z } from "zod";

import {
  type CaseAttachment,
  caseAttachmentsSchema,
} from "@/lib/types/case-types";

const STORAGE_KEY = "casecipher:attachments:v1";

const attachmentsStoreSchema = z.record(
  z.string(),
  z.array(caseAttachmentsSchema),
);

type AttachmentsStore = z.infer<typeof attachmentsStoreSchema>;

function readStore(): AttachmentsStore {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const result = attachmentsStoreSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

function writeStore(store: AttachmentsStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function attachmentKey(attachment: CaseAttachment): string {
  return `${attachment.name}:${attachment.lastModified}`;
}

export function toAttachmentMeta(
  files: FileList | File[] | null | undefined,
): CaseAttachment[] {
  if (!files) return [];
  return Array.from(files).map((f) => ({
    name: f.name,
    size: f.size,
    type: f.type || "application/octet-stream",
    lastModified: f.lastModified,
  }));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function listCaseAttachments(
  caseId: string,
): Promise<CaseAttachment[]> {
  return readStore()[caseId] ?? [];
}

export async function listAllCaseAttachments(): Promise<AttachmentsStore> {
  return readStore();
}

export async function addCaseAttachments(
  caseId: string,
  attachments: CaseAttachment[],
): Promise<CaseAttachment[]> {
  if (attachments.length === 0) {
    return readStore()[caseId] ?? [];
  }

  const store = readStore();
  const existing = store[caseId] ?? [];
  const existingKeys = new Set(existing.map(attachmentKey));
  const merged = [
    ...existing,
    ...attachments.filter((a) => !existingKeys.has(attachmentKey(a))),
  ];
  store[caseId] = merged;
  writeStore(store);
  return merged;
}

export async function removeCaseAttachment(
  caseId: string,
  key: string,
): Promise<CaseAttachment[]> {
  const store = readStore();
  const next = (store[caseId] ?? []).filter((a) => attachmentKey(a) !== key);
  store[caseId] = next;
  writeStore(store);
  return next;
}
