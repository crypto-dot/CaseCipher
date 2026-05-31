import type { CaseStageId, CaseStatus } from "@/lib/types/case-types";

export const STAGE_COLORS: Record<
  CaseStageId,
  { dot: string; badge: string }
> = {
  new_case: {
    dot: "bg-zinc-200",
    badge: "border-zinc-400/40 bg-zinc-500/15 text-zinc-200",
  },
  intake: {
    dot: "bg-blue-400",
    badge: "border-blue-400/40 bg-blue-500/15 text-blue-200",
  },
  processing: {
    dot: "bg-cyan-400",
    badge: "border-cyan-400/40 bg-cyan-500/15 text-cyan-200",
  },
  investigation: {
    dot: "bg-amber-400",
    badge: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  },
  report: {
    dot: "bg-violet-400",
    badge: "border-violet-400/40 bg-violet-500/15 text-violet-200",
  },
  review: {
    dot: "bg-rose-400",
    badge: "border-rose-400/40 bg-rose-500/15 text-rose-200",
  },
};

export function stageDotClass(stage: CaseStageId): string {
  return STAGE_COLORS[stage].dot;
}

export function stageBadgeClass(status: CaseStatus): string {
  return STAGE_COLORS[status].badge;
}
