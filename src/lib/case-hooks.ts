"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteCaseAttachment,
  listAllCaseAttachments,
  listCaseAttachments,
  uploadCaseAttachments,
} from "@/app/actions/attachments";
import {
  type CreateCaseFormInput,
  createCase,
  listCases,
  reassignCase,
  updateCaseStatus,
} from "@/lib/case-api";
import {
  type CreateEvidenceFormInput,
  createEvidence,
  listEvidence,
} from "@/lib/evidence-api";

const keys = {
  cases: ["cases"] as const,
  evidence: ["evidence"] as const,
  attachments: ["case-attachments"] as const,
};

export function useCases() {
  return useQuery({
    queryKey: keys.cases,
    queryFn: listCases,
  });
}

export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCaseFormInput) => createCase(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.cases });
    },
  });
}

export function useEvidence() {
  return useQuery({
    queryKey: keys.evidence,
    queryFn: listEvidence,
  });
}

export function useCreateEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEvidenceFormInput) => createEvidence(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.evidence });
    },
  });
}

export function useUpdateCaseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCaseStatus,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.cases });
    },
  });
}

export function useReassignCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reassignCase,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.cases });
    },
  });
}

export function useCaseAttachments(caseId: string | null) {
  return useQuery({
    queryKey: [...keys.attachments, caseId],
    queryFn: () => listCaseAttachments(caseId as string),
    enabled: Boolean(caseId),
  });
}

export function useAllCaseAttachments() {
  return useQuery({
    queryKey: keys.attachments,
    queryFn: listAllCaseAttachments,
  });
}

export function useAddCaseAttachments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, files }: { caseId: string; files: File[] }) => {
      const formData = new FormData();
      formData.set("caseId", caseId);
      for (const file of files) {
        formData.append("files", file);
      }
      console.log("formData", formData.getAll("files"));
      return await uploadCaseAttachments(formData);
    },
    onSuccess: async (_data, { caseId }) => {
      await qc.invalidateQueries({ queryKey: keys.attachments });
      await qc.invalidateQueries({ queryKey: [...keys.attachments, caseId] });
    },
  });
}

export function useRemoveCaseAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { caseId: string; id: string }) =>
      deleteCaseAttachment(id),
    onSuccess: async (_data, { caseId }) => {
      await qc.invalidateQueries({ queryKey: keys.attachments });
      await qc.invalidateQueries({ queryKey: [...keys.attachments, caseId] });
    },
  });
}
