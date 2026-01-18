"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Use the localStorage-based API for now until database is configured
// Once DATABASE_URL is set, these can be switched to use server actions
import {
  type CreateCaseInput,
  createCase,
  listCases,
  reassignCase,
  updateCaseStatus,
} from "@/lib/case-api";

const keys = {
  cases: ["cases"] as const,
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
    mutationFn: (input: CreateCaseInput) => createCase(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.cases });
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
