import type { CasePriority } from "@/lib/types/case-types";

export const PRIORITY_COLORS: Record<CasePriority, string> = {
  low: "border-emerald-400/40 text-emerald-200 bg-emerald-500/10",
  medium: "border-amber-400/50 text-amber-200 bg-amber-500/10",
  high: "border-rose-400/50 text-rose-200 bg-rose-500/10",
};

export function priorityPillClass(
  priority: CasePriority | null | undefined,
): string {
  return PRIORITY_COLORS[priority ?? "medium"];
}

export function priorityLabel(priority: CasePriority | null | undefined): string {
  const value = priority ?? "medium";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
