import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 container">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-linear-to-b from-primary/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-48 right-[-10%] h-[520px] w-[520px] rounded-full bg-linear-to-tr from-primary/15 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto container px-4 py-20 sm:px-6 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                Case management, encrypted-by-design workflow (frontend mock)
              </p>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                CaseCipher keeps your team aligned on every case.
              </h1>
              <p className="max-w-xl text-pretty text-lg leading-7 text-muted-foreground">
                Track status, ownership, and work-in-progress in one clean
                dashboard. Create cases in seconds, route them to the right
                person, and keep a clear audit trail.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/about">How it works</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-4 text-sm">
                <div>
                  <div className="text-2xl font-semibold tracking-tight">4</div>
                  <div className="text-muted-foreground">Statuses</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold tracking-tight">1</div>
                  <div className="text-muted-foreground">Source of truth</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold tracking-tight">∞</div>
                  <div className="text-muted-foreground">Clarity</div>
                </div>
              </div>
            </div>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
              <CardHeader>
                <CardTitle>Operational snapshot</CardTitle>
                <CardDescription>
                  A quick view of case status and who’s actively working.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      CASE-1002 · Evidence packet
                    </div>
                    <span className="text-xs text-muted-foreground">
                      In progress
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Assignee: Sam</span>
                    <span>Updated: minutes ago</span>
                  </div>
                </div>
                <div className="rounded-lg border bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      CASE-1003 · Signature mismatch
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Blocked
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Assignee: Jordan</span>
                    <span>Needs: client response</span>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium">Ownership clarity</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      See who is responsible for each case at a glance.
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium">Fast intake</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Validate new cases with clean forms and required fields.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto container px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need to run a case workflow
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Designed for teams that need consistent intake, transparent
              ownership, and reliable status reporting.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Status you can trust</CardTitle>
                <CardDescription>
                  Standardized states and quick transitions.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Keep your pipeline accurate with explicit status changes and
                consistent labels.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Clear ownership</CardTitle>
                <CardDescription>
                  Know who’s working on what—instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Reassign in one click and keep work balanced across the team.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Validated intake</CardTitle>
                <CardDescription>
                  Forms with guardrails built in.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Built with React Hook Form + Zod so required fields stay
                required.
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center">
            <div>
              <div className="text-lg font-semibold tracking-tight">
                Ready to try it?
              </div>
              <div className="text-sm text-muted-foreground">
                Jump into the dashboard to see the case workflow.
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
