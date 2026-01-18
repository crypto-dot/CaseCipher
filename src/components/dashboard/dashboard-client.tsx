"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCases,
  useReassignCase,
  useUpdateCaseStatus,
} from "@/lib/case-hooks";
import {
  type CaseItem,
  type CaseStatus,
  caseStatusesSchema,
} from "@/lib/case-types";
import { type Assignee, getAssigneeFullName, mockAssignees } from "@/lib/mocks";
import { cn } from "@/lib/utils";

function statusBadgeVariant(status: CaseStatus) {
  switch (status) {
    case "resolved":
      return "success";
    case "blocked":
      return "destructive";
    case "in_progress":
      return "warning";
    default:
      return "outline";
  }
}

function statusLabel(status: CaseStatus) {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "new":
      return "New";
    case "blocked":
      return "Blocked";
    case "resolved":
      return "Resolved";
  }
}

function groupByAssignee(cases: CaseItem[]) {
  const map = new Map<string, CaseItem[]>();
  for (const c of cases) {
    const list = map.get(c.assignee) ?? [];
    list.push(c);
    map.set(c.assignee, list);
  }
  return map;
}

export function DashboardClient() {
  const casesQuery = useCases();
  const updateStatusMut = useUpdateCaseStatus();
  const reassignMut = useReassignCase();

  const cases = casesQuery.data ?? [];

  const counts = React.useMemo(() => {
    const result: Record<CaseStatus, number> = {
      new: 0,
      in_progress: 0,
      blocked: 0,
      resolved: 0,
    };
    for (const c of cases) result[c.status] += 1;
    return result;
  }, [cases]);

  const byAssignee = React.useMemo(() => groupByAssignee(cases), [cases]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage cases, track status, and see who’s working on what.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="self-end">
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            onClick={() => casesQuery.refetch()}
            disabled={casesQuery.isFetching}
          >
            {casesQuery.isFetching ? (
              <>
                <Loader2 className="animate-spin" />
                Refreshing
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New</CardTitle>
            <CardDescription>Awaiting triage</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {counts.new}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">In progress</CardTitle>
            <CardDescription>Actively being worked</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {counts.in_progress}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blocked</CardTitle>
            <CardDescription>Needs input or dependency</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {counts.blocked}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolved</CardTitle>
            <CardDescription>Completed work</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {counts.resolved}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cases</CardTitle>
              <Button
                asChild
                className="w-fit relative top-[10px] border-2 border-primary"
              >
                <Link href="/dashboard/cases/new">Create a new case</Link>
              </Button>
            </div>
            <CardDescription>
              Status, ownership, and quick updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {casesQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" />
                Loading cases…
              </div>
            ) : casesQuery.isError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                Failed to load cases. Try refreshing.
              </div>
            ) : cases.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No cases yet—create your first one.
              </div>
            ) : (
              <div className="divide-y rounded-lg border">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="grid gap-3 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.id}
                        </span>
                        <Badge variant={statusBadgeVariant(c.status)}>
                          {statusLabel(c.status)}
                        </Badge>
                      </div>
                      <div className="mt-1 truncate font-medium">{c.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Client:{" "}
                        <span className="text-foreground/90">{c.client}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Assignee
                      </div>
                      <Select
                        value={c.assignee}
                        onValueChange={(assignee) =>
                          reassignMut.mutate({ id: c.id, assignee })
                        }
                        disabled={reassignMut.isPending}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAssignees.map((assignee: Assignee) => (
                            <SelectItem key={assignee.id} value={assignee.id}>
                              {getAssigneeFullName(assignee)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Status
                      </div>
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
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {caseStatusesSchema.options.map((s) => (
                            <SelectItem key={s} value={s}>
                              {statusLabel(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              className={cn(
                "text-xs text-muted-foreground",
                cases.length ? "" : "hidden",
              )}
            >
              Tip: changes are saved to localStorage so they persist on refresh.
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 h-full">
          <Card>
            <CardHeader>
              <CardTitle>Workload by assignee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAssignees.map((assignee: Assignee) => {
                const list = byAssignee.get(assignee.id) ?? [];
                const active = list.filter(
                  (c) => c.status !== "resolved",
                ).length;
                return (
                  <div
                    key={assignee.id}
                    className="flex items-center justify-between"
                  >
                    <div className="text-sm font-medium">
                      {getAssigneeFullName(assignee)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {active} active / {list.length} total
                      </span>
                      <Badge
                        variant={
                          active > 3
                            ? "destructive"
                            : active > 0
                              ? "orange"
                              : "info"
                        }
                      >
                        {active > 0 ? "Working" : "Available"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
