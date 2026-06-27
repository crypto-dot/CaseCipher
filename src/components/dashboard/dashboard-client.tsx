"use client";

import {
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import { differenceInCalendarDays } from "date-fns";
import {
  Clock,
  FolderOpen,
  GripVertical,
  Loader2,
  Plus,
  Shield,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { CaseDetailModal } from "@/components/dashboard/case-detail-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAllCaseAttachments,
  useCases,
  useReassignCase,
  useUpdateCaseStatus,
} from "@/lib/case-hooks";
import { type Assignee, getAssigneeById, mockAssignees } from "@/lib/mocks";
import { priorityLabel, priorityPillClass } from "@/lib/priority-colors";
import { stageDotClass } from "@/lib/stage-colors";
import {
  CASE_STAGES,
  type Case,
  type CaseAttachment,
  type CaseStageId,
  type CaseStatus,
  caseStatusLabel,
  caseStatusSchema,
} from "@/lib/types/case-types";
import { cn } from "@/lib/utils";

/** Kanban columns — each stage maps directly to `CaseStatus`. */
const BOARD_COLUMNS = CASE_STAGES.map((stage) => ({
  id: stage.id,
  label: stage.label,
  dotClass: stageDotClass(stage.id),
}));

type BoardColumnId = CaseStageId;
type BoardColumn = (typeof BOARD_COLUMNS)[number];

const CASE_PRIORITY_RANK = {
  high: 3,
  medium: 2,
  low: 1,
} as const;

function columnForCase(status: CaseStatus): BoardColumnId {
  if (caseStatusSchema.safeParse(status).success) return status;
  return "new_case";
}

function sortCasesByPriority(a: Case, b: Case) {
  const priorityDelta =
    (CASE_PRIORITY_RANK[b.priority ?? "low"] ?? 0) -
    (CASE_PRIORITY_RANK[a.priority ?? "low"] ?? 0);

  if (priorityDelta !== 0) return priorityDelta;

  return b.updatedAt.localeCompare(a.updatedAt);
}

function formatBoardCaseId(c: Case) {
  const source = c.caseNumber ?? c.id;
  const match = /^CASE-(\d+)$/i.exec(source.trim());
  if (!match && c.caseNumber) return c.caseNumber;
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
  if (c.caseType) return c.caseType;
  if (c.requestor) return c.requestor;
  const t = c.title.trim();
  const colon = t.indexOf(":");
  if (colon > 0 && colon < 24) return t.slice(0, colon).trim();
  const clientMatch = c.description?.match(/^Client:\s*([^.]+)/);
  return clientMatch?.[1]?.trim() || "General";
}

function CaseBoardColumn({
  attachmentsByCase,
  cases,
  column,
  dragPlaceholderHeight,
  draggedFromColumnId,
  hoveredColumnId,
  isStatusUpdating,
  onOpenCase,
  onReassignCase,
  onUpdateStatus,
  reassignPending,
}: {
  attachmentsByCase: Record<string, CaseAttachment[]>;
  cases: Case[];
  column: BoardColumn;
  dragPlaceholderHeight: number | null;
  draggedFromColumnId: BoardColumnId | null;
  hoveredColumnId: BoardColumnId | null;
  isStatusUpdating: boolean;
  onOpenCase: (caseId: string) => void;
  onReassignCase: (caseId: string, assignedTo: string) => void;
  onUpdateStatus: (caseId: string, status: CaseStatus) => void;
  reassignPending: boolean;
}) {
  const { isDropTarget, ref } = useDroppable({
    id: column.id,
    data: { status: column.id },
    type: "case-lane",
    accept: "case-card",
  });
  const showDropPlaceholder =
    hoveredColumnId === column.id &&
    draggedFromColumnId !== column.id &&
    dragPlaceholderHeight != null &&
    cases.length > 0;

  return (
    <section
      ref={ref}
      className={cn(
        "case-board-column flex h-full max-h-full min-h-0 w-70 shrink-0 flex-1 flex-col rounded-2xl border border-white/8 bg-[hsl(222_44%_8%/0.65)] transition-[background-color,border-color]",
        isDropTarget &&
          "border-[hsl(213_94%_55%/0.55)] bg-[hsl(213_94%_20%/0.22)]",
      )}
      aria-label={column.label}
    >
      <div className="case-board-column-head flex shrink-0 items-center justify-between gap-2 border-b border-white/8 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "size-2 shrink-0 rounded-full ring-2 ring-white/10",
              column.dotClass,
            )}
            aria-hidden
          />
          <h2 className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {column.label}
          </h2>
        </div>
        <output
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4 text-xs font-medium text-foreground"
          aria-label={`${cases.length} cases in ${column.label}`}
        >
          {cases.length}
        </output>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {cases.length === 0 ? (
          <p className="flex min-h-48 flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 py-6 text-center text-sm text-muted-foreground/70">
            Drop cases here
          </p>
        ) : (
          <>
            {showDropPlaceholder ? (
              <div
                className="shrink-0 rounded-xl border border-dashed border-[hsl(213_94%_55%/0.45)] bg-[hsl(213_94%_20%/0.16)] transition-[height]"
                style={{ height: dragPlaceholderHeight }}
                aria-hidden
              />
            ) : null}
            {cases.map((caseItem) => (
              <CaseBoardCard
                key={caseItem.id}
                caseItem={caseItem}
                fileCount={attachmentsByCase[caseItem.id]?.length ?? 0}
                isStatusUpdating={isStatusUpdating}
                onOpen={onOpenCase}
                onReassign={onReassignCase}
                onUpdateStatus={onUpdateStatus}
                reassignPending={reassignPending}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function CaseBoardCard({
  caseItem,
  fileCount,
  isStatusUpdating,
  onOpen,
  onReassign,
  onUpdateStatus,
  reassignPending,
}: {
  caseItem: Case;
  fileCount: number;
  isStatusUpdating: boolean;
  onOpen: (caseId: string) => void;
  onReassign: (caseId: string, assignedTo: string) => void;
  onUpdateStatus: (caseId: string, status: CaseStatus) => void;
  reassignPending: boolean;
}) {
  const { isDragging, ref } = useDraggable({
    id: caseItem.id,
    data: {
      caseId: caseItem.id,
      status: caseItem.status,
    },
    disabled: isStatusUpdating,
    type: "case-card",
  });

  return (
    <article
      ref={ref}
      className={cn(
        "case-board-card group cursor-grab rounded-xl border border-white/10 bg-[hsl(222_43%_11%/0.95)] p-3.5 transition-[border-color,box-shadow,opacity,transform] hover:border-[hsl(213_94%_55%/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(213_94%_55%/0.45)] active:cursor-grabbing",
        isDragging && "scale-[0.98] cursor-grabbing opacity-45",
      )}
      onClick={() => {
        if (!isDragging) onOpen(caseItem.id);
      }}
      onKeyDown={(e) => {
        if (e.currentTarget !== e.target) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(caseItem.id);
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors group-hover:bg-white/6 group-hover:text-foreground"
            aria-hidden
          >
            <GripVertical className="size-3.5" aria-hidden />
          </span>
          <span className="truncate font-mono text-[0.7rem] text-muted-foreground">
            {formatBoardCaseId(caseItem)}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium capitalize",
            priorityPillClass(caseItem.priority ?? undefined),
          )}
        >
          {priorityLabel(caseItem.priority ?? undefined)}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
        {caseItem.title}
      </h3>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield
            className="size-3.5 shrink-0 text-muted-foreground/80"
            aria-hidden
          />
          <span className="truncate">{caseCategoryLabel(caseItem)}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserRound
            className="size-3.5 shrink-0 text-muted-foreground/80"
            aria-hidden
          />
          <span className="truncate">
            {getAssigneeById(caseItem.assignedTo ?? "")?.firstName ??
              caseItem.assignedExaminer ??
              "Unassigned"}
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
        <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />
        {lastActivityLabel(caseItem.updatedAt)}
      </div>

      <div className="mt-3 grid gap-2 border-t border-white/6 pt-3">
        <div className="grid grid-cols-1 gap-1.5">
          <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            Assignee
          </span>
          <Select
            value={caseItem.assignedTo ?? ""}
            onValueChange={(assignedTo) => onReassign(caseItem.id, assignedTo)}
            disabled={reassignPending}
          >
            <SelectTrigger
              className="h-8 border-white/10 bg-white/4 text-xs"
              onClick={(event) => event.stopPropagation()}
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {mockAssignees.map((assignee: Assignee) => (
                <SelectItem key={assignee.id} value={assignee.id}>
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
            value={caseItem.status}
            onValueChange={(status) =>
              onUpdateStatus(caseItem.id, status as CaseStatus)
            }
            disabled={isStatusUpdating}
          >
            <SelectTrigger
              className="h-8 border-white/10 bg-white/4 text-xs"
              onClick={(event) => event.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {caseStatusSchema.options.map((status) => (
                <SelectItem key={status} value={status}>
                  {caseStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </article>
  );
}

export function DashboardClient() {
  const casesQuery = useCases();
  const attachmentsQuery = useAllCaseAttachments();
  const updateStatusMut = useUpdateCaseStatus();
  const reassignMut = useReassignCase();
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(
    null,
  );
  const [dragPreview, setDragPreview] = React.useState<{
    draggedFromColumnId: BoardColumnId;
    height: number;
    hoveredColumnId: BoardColumnId | null;
  } | null>(null);

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
      list.sort(sortCasesByPriority);
    }
    return map;
  }, [cases]);

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const rect = event.operation.source?.element?.getBoundingClientRect();
    const status = event.operation.source?.data.status;
    const parsedStatus = caseStatusSchema.safeParse(status);

    if (!parsedStatus.success) return;

    setDragPreview({
      draggedFromColumnId: parsedStatus.data,
      height: rect?.height ?? 160,
      hoveredColumnId: null,
    });
  }, []);

  const handleDragOver = React.useCallback((event: DragOverEvent) => {
    const status = event.operation.target?.data.status;
    const parsedStatus = caseStatusSchema.safeParse(status);

    setDragPreview((current) =>
      current
        ? {
            ...current,
            hoveredColumnId: parsedStatus.success ? parsedStatus.data : null,
          }
        : current,
    );
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      setDragPreview(null);
      if (event.canceled) return;

      const caseId = event.operation.source?.data.caseId;
      const status = event.operation.target?.data.status;
      const parsedStatus = caseStatusSchema.safeParse(status);

      if (typeof caseId !== "string" || !parsedStatus.success) return;

      const draggedCase = cases.find((c) => c.id === caseId);
      if (!draggedCase || draggedCase.status === parsedStatus.data) return;

      updateStatusMut.mutate({ id: caseId, status: parsedStatus.data });
    },
    [cases, updateStatusMut],
  );

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
            className="border-white/15 bg-white/4 text-foreground shadow-none hover:bg-white/[0.07]"
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
            className="rounded-xl bg-[hsl(213_94%_55%)] px-5 font-medium text-white hover:bg-[hsl(213_94%_48%)]"
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
          <DragDropProvider
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
          >
            <div className="case-board-columns flex h-full min-h-0 w-full gap-4 px-1">
              {BOARD_COLUMNS.map((col) => (
                <CaseBoardColumn
                  key={col.id}
                  attachmentsByCase={attachmentsByCase}
                  cases={casesByColumn.get(col.id) ?? []}
                  column={col}
                  dragPlaceholderHeight={dragPreview?.height ?? null}
                  draggedFromColumnId={dragPreview?.draggedFromColumnId ?? null}
                  hoveredColumnId={dragPreview?.hoveredColumnId ?? null}
                  isStatusUpdating={updateStatusMut.isPending}
                  onOpenCase={setSelectedCaseId}
                  onReassignCase={(id, assignedTo) =>
                    reassignMut.mutate({ id, assignedTo })
                  }
                  onUpdateStatus={(id, status) =>
                    updateStatusMut.mutate({ id, status })
                  }
                  reassignPending={reassignMut.isPending}
                />
              ))}
            </div>
          </DragDropProvider>
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
