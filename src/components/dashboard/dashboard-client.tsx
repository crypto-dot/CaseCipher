"use client";

import { differenceInCalendarDays } from "date-fns";
import {
  Clock,
  FolderOpen,
  Loader2,
  Plus,
  Shield,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseDetailModal } from "@/components/dashboard/case-detail-modal";
import {
  useAllCaseAttachments,
  useCases,
  useReassignCase,
  useUpdateCaseStatus,
} from "@/lib/case-hooks";
import { stageDotClass } from "@/lib/stage-colors";
import { priorityLabel, priorityPillClass } from "@/lib/priority-colors";
import {
  type Case,
  type CaseStageId,
  type CaseStatus,
  CASE_STAGES,
  caseStatusLabel,
  caseStatusSchema,
} from "@/lib/types/case-types";
import { type Assignee, getAssigneeById, mockAssignees } from "@/lib/mocks";
import { cn } from "@/lib/utils";

/** Kanban columns — each stage maps directly to `CaseStatus`. */
const BOARD_COLUMNS = CASE_STAGES.map((stage) => ({
  id: stage.id,
  label: stage.label,
  dotClass: stageDotClass(stage.id),
}));

type BoardColumnId = CaseStageId;

function columnForCase(status: CaseStatus): BoardColumnId {
  if (caseStatusSchema.safeParse(status).success) return status;
  return "new_case";
}

function formatBoardCaseId(c: Case) {
  const source = c.caseNumber ?? c.id;
  const match = /^CASE-(\d+)$/i.exec(source.trim());
  const n = match ? Number.parseInt(match[1], 10) : 0;
  const yy = new Date(c.createdAt).getFullYear().toString().slice(-2);
  const seq = Number.isFinite(n) ? n : 0;
  return `CAS-${yy}-${String(seq).padStart(4, "0")}`;
}

function lastActivityLabel(iso: string) {
  const days = differenceInCalendarDays(new Date(), new Date(iso));
  if (days <= 0) return "Today";
  if (days === 1) return "1d since last activity";
  return `${days}d since last activity`;
}

function caseCategoryLabel(c: Case) {
  const t = c.title.trim();
  const colon = t.indexOf(":");
  if (colon > 0 && colon < 24) return t.slice(0, colon).trim();
  const clientMatch = c.description?.match(/^Client:\s*([^.]+)/);
  return clientMatch?.[1]?.trim() || "General";
}

export function DashboardClient() {
  const casesQuery = useCases();
  const attachmentsQuery = useAllCaseAttachments();
  const updateStatusMut = useUpdateCaseStatus();
  const reassignMut = useReassignCase();
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(
    null,
  );

  const cases = casesQuery.data ?? [];
  const attachmentsByCase = attachmentsQuery.data ?? {};
  const selectedCase =
    selectedCaseId != null
      ? (cases.find((c) => c.id === selectedCaseId) ?? null)
      : null;

  const activeCount = React.useMemo(
    () => cases.filter((c) => c.status !== "review").length,
    [cases],
  );

  const casesByColumn = React.useMemo(() => {
    const map = new Map<BoardColumnId, Case[]>();
    for (const col of BOARD_COLUMNS) {
      map.set(col.id, []);
    }
    for (const c of cases) {
      const colId = columnForCase(c.status);
      map.get(colId)?.push(c);
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return map;
  }, [cases]);

  return (
    <div className="case-board flex min-h-0 flex-1 flex-col gap-8">
      <header className="case-board-header flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Case board
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCount} active {activeCount === 1 ? "case" : "cases"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="border-white/15 bg-white/[0.04] text-foreground shadow-none hover:bg-white/[0.07]"
            onClick={() => casesQuery.refetch()}
            disabled={casesQuery.isFetching}
            aria-label="Refresh cases"
          >
            {casesQuery.isFetching ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Refreshing
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button
            asChild
            className="rounded-xl bg-[hsl(213_94%_55%)] px-5 font-medium text-white shadow-lg shadow-[hsl(213_94%_35%/0.35)] hover:bg-[hsl(213_94%_48%)]"
          >
            <Link
              href="/dashboard/cases/new"
              className="inline-flex items-center gap-2"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              New case
            </Link>
          </Button>
        </div>
      </header>

      {casesQuery.isLoading ? (
        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading cases…
        </div>
      ) : casesQuery.isError ? (
        <div className="shrink-0 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Failed to load cases. Try refreshing.
        </div>
      ) : (
        <div className="case-board-scroll -mx-1 flex min-h-0 flex-1 flex-col overflow-x-auto pb-2">
          <div className="case-board-columns flex h-full min-h-0 gap-4 px-1 w-full">
            {BOARD_COLUMNS.map((col) => {
              const list = casesByColumn.get(col.id) ?? [];
              return (
                <section
                  key={col.id}
                  className="case-board-column flex-1 flex h-full max-h-full min-h-0 w-[17.5rem] shrink-0 flex-col rounded-2xl border border-white/[0.08] bg-[hsl(222_44%_8%/0.65)] shadow-[inset_0_1px_0_hsl(210_40%_96%/0.04)]"
                  aria-label={col.label}
                >
                  <div className="case-board-column-head flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full ring-2 ring-white/10",
                          col.dotClass,
                        )}
                        aria-hidden
                      />
                      <h2 className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {col.label}
                      </h2>
                    </div>
                    <output
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-foreground"
                      aria-label={`${list.length} cases in ${col.label}`}
                    >
                      {list.length}
                    </output>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
                    {list.length === 0 ? (
                      <p className="flex min-h-[12rem] flex-1 items-center justify-center py-6 text-center text-sm text-muted-foreground/70">
                        No cases
                      </p>
                    ) : (
                      list.map((c) => {
                        const fileCount = attachmentsByCase[c.id]?.length ?? 0;
                        return (
                          <article
                            key={c.id}
                            className="case-board-card group cursor-pointer rounded-xl border border-white/[0.1] bg-[hsl(222_43%_11%/0.95)] p-3.5 shadow-[0_12px_32px_hsl(222_70%_3%/0.35)] transition-[border-color,box-shadow] hover:border-[hsl(213_94%_55%/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(213_94%_55%/0.45)]"
                            onClick={() => setSelectedCaseId(c.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedCaseId(c.id);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono text-[0.7rem] text-muted-foreground">
                                {formatBoardCaseId(c)}
                              </span>
                              <span
                                className={cn(
                                  "shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium capitalize",
                                  priorityPillClass(c.priority ?? undefined),
                                )}
                              >
                                {priorityLabel(c.priority ?? undefined)}
                              </span>
                            </div>
                            <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                              {c.title}
                            </h3>
                            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Shield
                                  className="size-3.5 shrink-0 text-muted-foreground/80"
                                  aria-hidden
                                />
                                <span className="truncate">
                                  {caseCategoryLabel(c)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UserRound
                                  className="size-3.5 shrink-0 text-muted-foreground/80"
                                  aria-hidden
                                />
                                <span className="truncate">
                                  {getAssigneeById(c.assignedTo ?? "")
                                    ?.firstName ?? "Unassigned"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FolderOpen
                                  className="size-3.5 shrink-0 text-muted-foreground/80"
                                  aria-hidden
                                />
                                <span>
                                  {fileCount === 0
                                    ? "No items"
                                    : `${fileCount} ${fileCount === 1 ? "file" : "files"}`}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                              <Clock
                                className="size-3.5 shrink-0 opacity-80"
                                aria-hidden
                              />
                              {lastActivityLabel(c.updatedAt)}
                            </div>

                            <button
                              className="mt-3 grid gap-2 border-t border-white/[0.06] pt-3"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              type="button"
                            >
                              <div className="grid grid-cols-1 gap-1.5">
                                <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                                  Assignee
                                </span>
                                <Select
                                  value={c.assignedTo ?? ""}
                                  onValueChange={(assignedTo) =>
                                    reassignMut.mutate({ id: c.id, assignedTo })
                                  }
                                  disabled={reassignMut.isPending}
                                >
                                  <SelectTrigger className="h-8 border-white/10 bg-white/[0.04] text-xs">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockAssignees.map((assignee: Assignee) => (
                                      <SelectItem
                                        key={assignee.id}
                                        value={assignee.id}
                                      >
                                        {assignee.firstName} {assignee.lastName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-1 gap-1.5">
                                <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                                  Stage
                                </span>
                                <Select
                                  value={c.status}
                                  onValueChange={(status) =>
                                    updateStatusMut.mutate({
                                      id: c.id,
                                      status: status as CaseStatus,
                                    })
                                  }
                                  disabled={updateStatusMut.isPending}
                                >
                                  <SelectTrigger className="h-8 border-white/10 bg-white/[0.04] text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {caseStatusSchema.options.map((s) => (
                                      <SelectItem key={s} value={s}>
                                        {caseStatusLabel(s)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </button>
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      <CaseDetailModal
        caseItem={selectedCase}
        open={selectedCaseId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedCaseId(null);
        }}
      />

      <p className="shrink-0 text-xs text-muted-foreground/80">
        Changes are saved locally and persist when you refresh this browser.
      </p>
    </div>
  );
}
