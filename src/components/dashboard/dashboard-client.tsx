"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { caseStatuses, teamMembers, type CaseItem, type CaseStatus } from "@/lib/case-types";
import { useCases, useCreateCase, useReassignCase, useUpdateCaseStatus } from "@/lib/case-hooks";
import { cn } from "@/lib/utils";

const createCaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  client: z.string().min(2, "Client must be at least 2 characters"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  status: z.enum(caseStatuses),
  assignee: z.enum(teamMembers),
});

type CreateCaseValues = z.infer<typeof createCaseSchema>;

function statusBadgeVariant(status: CaseStatus) {
  switch (status) {
    case "resolved":
      return "success";
    case "blocked":
      return "destructive";
    case "in_progress":
      return "warning";
    case "new":
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
  const createCaseMut = useCreateCase();
  const updateStatusMut = useUpdateCaseStatus();
  const reassignMut = useReassignCase();

  const form = useForm<CreateCaseValues>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      title: "",
      client: "",
      description: "",
      status: "new",
      assignee: "Alex",
    },
    mode: "onSubmit",
  });

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

  async function onSubmit(values: CreateCaseValues) {
    await createCaseMut.mutateAsync({
      title: values.title,
      client: values.client,
      description: values.description || undefined,
      status: values.status,
      assignee: values.assignee,
    });
    form.reset({ title: "", client: "", description: "", status: "new", assignee: values.assignee });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage cases, track status, and see who’s working on what.
          </p>
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

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New</CardTitle>
            <CardDescription>Awaiting triage</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{counts.new}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">In progress</CardTitle>
            <CardDescription>Actively being worked</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{counts.in_progress}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blocked</CardTitle>
            <CardDescription>Needs input or dependency</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{counts.blocked}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolved</CardTitle>
            <CardDescription>Completed work</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{counts.resolved}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cases</CardTitle>
            <CardDescription>Status, ownership, and quick updates.</CardDescription>
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
              <div className="text-sm text-muted-foreground">No cases yet—create your first one.</div>
            ) : (
              <div className="divide-y rounded-lg border">
                {cases.map((c) => (
                  <div key={c.id} className="grid gap-3 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                        <Badge variant={statusBadgeVariant(c.status)}>{statusLabel(c.status)}</Badge>
                      </div>
                      <div className="mt-1 truncate font-medium">{c.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Client: <span className="text-foreground/90">{c.client}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-medium text-muted-foreground">Assignee</div>
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
                          {teamMembers.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-medium text-muted-foreground">Status</div>
                      <Select
                        value={c.status}
                        onValueChange={(status) =>
                          updateStatusMut.mutate({ id: c.id, status: status as CaseStatus })
                        }
                        disabled={updateStatusMut.isPending}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {caseStatuses.map((s) => (
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

            <div className={cn("text-xs text-muted-foreground", cases.length ? "" : "hidden")}>
              Tip: changes are saved to localStorage so they persist on refresh.
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Who’s working on what</CardTitle>
              <CardDescription>Workload by assignee.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((m) => {
                const list = byAssignee.get(m) ?? [];
                const active = list.filter((c) => c.status !== "resolved").length;
                return (
                  <div key={m} className="flex items-center justify-between">
                    <div className="text-sm font-medium">{m}</div>
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

          <Card>
            <CardHeader>
              <CardTitle>Create a case</CardTitle>
              <CardDescription>Validated form (React Hook Form + Zod).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Intake: new claim" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Northwind Logistics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Optional context and next steps…" {...field} />
                        </FormControl>
                        <FormDescription>Optional. Keep it short and actionable.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {caseStatuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {statusLabel(s)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignee</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select assignee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {teamMembers.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <Button type="submit" className="w-full" disabled={createCaseMut.isPending}>
                    {createCaseMut.isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create case"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


