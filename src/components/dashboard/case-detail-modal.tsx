"use client";

import {
  Download,
  FileIcon,
  Loader2,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { attachmentKey, formatFileSize } from "@/lib/attachments";
import {
  useAddCaseAttachments,
  useCaseAttachments,
  useClients,
  useReassignCase,
  useRemoveCaseAttachment,
  useUpdateCaseStatus,
} from "@/lib/case-hooks";
import {
  type Assignee,
  getAssigneeById,
  mockAssignees,
  resolveClientName,
} from "@/lib/mocks";
import { priorityLabel, priorityPillClass } from "@/lib/priority-colors";
import {
  type Case,
  type CaseStatus,
  caseStatusLabel,
  caseStatusSchema,
} from "@/lib/types/case-types";
import { cn } from "@/lib/utils";

function formatBoardCaseId(c: Case) {
  const source = c.caseNumber ?? c.id;
  const match = /^CASE-(\d+)$/i.exec(source.trim());
  if (!match && c.caseNumber) return c.caseNumber;
  const n = match ? Number.parseInt(match[1], 10) : 0;
  const yy = new Date(c.createdAt).getFullYear().toString().slice(-2);
  const seq = Number.isFinite(n) ? n : 0;
  return `CAS-${yy}-${String(seq).padStart(4, "0")}`;
}

type CaseDetailModalProps = {
  caseItem: Case | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CaseDetailModal({
  caseItem,
  open,
  onOpenChange,
}: CaseDetailModalProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const attachmentsQuery = useCaseAttachments(caseItem?.id ?? null);
  const clientsQuery = useClients();
  const addAttachmentsMut = useAddCaseAttachments();
  const removeAttachmentMut = useRemoveCaseAttachment();
  const updateStatusMut = useUpdateCaseStatus();
  const reassignMut = useReassignCase();

  const attachments = attachmentsQuery.data ?? [];
  const assignee = caseItem
    ? getAssigneeById(caseItem.assignedTo ?? "")
    : undefined;

  const handleFiles = React.useCallback(
    async (files: FileList | File[] | null) => {
      if (!caseItem || !files?.length) return;

      const data = await addAttachmentsMut.mutateAsync({
        caseId: caseItem.id,
        files: Array.from(files),
      });
      console.log("data", data);
    },
    [caseItem, addAttachmentsMut.data],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (!caseItem) return null;

  const caseDetails = [
    ["Case type", caseItem.caseType],
    ["Client", resolveClientName(caseItem.clientId, clientsQuery.data ?? [])],
    ["Subject name", caseItem.subjectName],
    ["Department", caseItem.department],
    ["Date received", caseItem.dateReceived],
    ["Date due", caseItem.dateDue],
  ] satisfies Array<[string, string | null]>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,48rem)] gap-0 overflow-hidden rounded-2xl border-white/8 bg-[hsl(222_44%_8%/0.98)] p-0 sm:max-w-xl"
        showCloseButton
      >
        <DialogHeader className="gap-3 border-b border-white/8 px-6 py-5 text-left">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <Badge
              variant="outline"
              className="border-white/15 bg-white/4 font-mono text-[0.7rem] text-muted-foreground"
            >
              {formatBoardCaseId(caseItem)}
            </Badge>
            {caseItem.priority ? (
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  priorityPillClass(caseItem.priority),
                )}
              >
                {priorityLabel(caseItem.priority)}
              </Badge>
            ) : null}
          </div>
          <DialogTitle className="text-xl leading-snug">
            {caseItem.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Case details, assignee, stage, and uploaded files for{" "}
            {formatBoardCaseId(caseItem)}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(min(90vh,48rem)-5.5rem)]">
          <div className="space-y-6 px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Person assigned
                </Label>
                <Select
                  value={caseItem.assignedTo ?? ""}
                  onValueChange={(assignedTo) =>
                    reassignMut.mutate({ id: caseItem.id, assignedTo })
                  }
                  disabled={reassignMut.isPending}
                >
                  <SelectTrigger className="h-9 border-white/10 bg-white/4">
                    <div className="flex items-center gap-2">
                      <UserRound className="size-4 text-muted-foreground" />
                      <SelectValue placeholder="Unassigned" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {mockAssignees.map((a: Assignee) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.firstName} {a.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!caseItem.assignedTo && (
                  <p className="text-xs text-muted-foreground">
                    No investigator assigned yet.
                  </p>
                )}
                {assignee && (
                  <p className="text-xs text-muted-foreground">
                    Currently assigned to {assignee.firstName}{" "}
                    {assignee.lastName}.
                  </p>
                )}
                {!assignee && caseItem.assignedExaminer ? (
                  <p className="text-xs text-muted-foreground">
                    Currently assigned to {caseItem.assignedExaminer}.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Stage
                </Label>
                <Select
                  value={caseItem.status}
                  onValueChange={(status) =>
                    updateStatusMut.mutate({
                      id: caseItem.id,
                      status: status as CaseStatus,
                    })
                  }
                  disabled={updateStatusMut.isPending}
                >
                  <SelectTrigger className="h-9 border-white/10 bg-white/4">
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
            </div>

            <Separator className="bg-white/8" />

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {caseDetails.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/3 p-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {label}
                  </Label>
                  <p className="mt-1 text-foreground">{value || "Not set"}</p>
                </div>
              ))}
            </div>

            {caseItem.description ? (
              <div className="rounded-lg bg-white/3 p-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Description
                </Label>
                <p className="mt-1 text-sm text-foreground">
                  {caseItem.description}
                </p>
              </div>
            ) : null}

            <Separator className="bg-white/8" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Case files
                </Label>
                <span className="text-xs text-muted-foreground">
                  {attachments.length}{" "}
                  {attachments.length === 1 ? "file" : "files"}
                </span>
              </div>

              <button
                type="button"
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                  isDragging
                    ? "border-[hsl(213_94%_55%/0.65)] bg-[hsl(213_94%_55%/0.08)]"
                    : "border-white/15 bg-white/2 hover:border-white/25 hover:bg-white/4",
                )}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                disabled={addAttachmentsMut.isPending}
              >
                <Upload
                  className={cn(
                    "size-8",
                    isDragging
                      ? "text-[hsl(213_94%_55%)]"
                      : "text-muted-foreground",
                  )}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Drag and drop files here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse from your computer
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </button>

              {addAttachmentsMut.isPending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Uploading files…
                </div>
              )}

              {(addAttachmentsMut.isError ||
                attachmentsQuery.isError ||
                removeAttachmentMut.isError) && (
                <p className="text-sm text-destructive" role="alert">
                  {addAttachmentsMut.error instanceof Error
                    ? addAttachmentsMut.error.message
                    : attachmentsQuery.error instanceof Error
                      ? attachmentsQuery.error.message
                      : removeAttachmentMut.error instanceof Error
                        ? removeAttachmentMut.error.message
                        : "File action failed. Try again."}
                </p>
              )}

              {attachmentsQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading files…
                </div>
              ) : attachments.length === 0 ? (
                <p className="rounded-lg border border-white/6 bg-white/2 px-4 py-3 text-sm text-muted-foreground">
                  No files uploaded to this case yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {attachments.map((file) => {
                    const key = attachmentKey(file);
                    return (
                      <li
                        key={key}
                        className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5"
                      >
                        <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {file.filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                            {" · "}
                            {file.contentType}
                          </p>
                        </div>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <a
                            href={`/api/attachments/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Download ${file.filename}`}
                          >
                            <Download className="size-4" />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${file.filename}`}
                          disabled={removeAttachmentMut.isPending}
                          onClick={() =>
                            removeAttachmentMut.mutate({
                              caseId: caseItem.id,
                              id: file.id,
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <p className="text-xs text-muted-foreground/80">
                Files are stored in secure backend storage. Downloads are
                authenticated and use short-lived access to storage.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
