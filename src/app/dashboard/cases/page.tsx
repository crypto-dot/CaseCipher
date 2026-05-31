"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCases } from "@/lib/case-hooks";
import { stageBadgeClass } from "@/lib/stage-colors";
import { caseStatusLabel } from "@/lib/types/case-types";
import { getAssigneeNameById } from "@/lib/mocks";
import { cn } from "@/lib/utils";

export default function CasesListPage() {
  const casesQuery = useCases();
  const cases = casesQuery.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All matters, newest activity first.
          </p>
        </div>
        <Button
          asChild
          className="w-fit rounded-xl bg-[hsl(213_94%_55%)] font-medium text-white shadow-lg shadow-[hsl(213_94%_35%/0.35)] hover:bg-[hsl(213_94%_48%)]"
        >
          <Link href="/dashboard/cases/new">New case</Link>
        </Button>
      </header>

      {casesQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      ) : casesQuery.isError ? (
        <p className="text-sm text-destructive">Could not load cases.</p>
      ) : cases.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No cases yet.{" "}
          <Link
            href="/dashboard/cases/new"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[hsl(222_44%_8%/0.65)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {cases.map((c) => (
                <tr key={c.id} className="text-foreground/95">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {c.id}
                  </td>
                  <td className="max-w-[14rem] truncate px-4 py-3 font-medium">
                    {c.title}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border font-normal",
                        stageBadgeClass(c.status),
                      )}
                    >
                      {caseStatusLabel(c.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.assignedTo ? getAssigneeNameById(c.assignedTo) : "Unassigned"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
