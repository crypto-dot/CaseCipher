import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="dashboard-main">
        <div className="dashboard-shell-inner">
          <div className="mx-auto container px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-8">
                <div className="space-y-5">
                  <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                    CaseCipher keeps every case clear, current, and accountable.
                  </h1>
                  <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
                    Bring intake, ownership, status, and activity into one calm
                    workspace so teams can move faster without losing the audit
                    trail.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="rounded-full px-7">
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full bg-white/4 px-7 text-foreground shadow-none hover:bg-white/8"
                  >
                    <Link href="/about">How it works</Link>
                  </Button>
                </div>
              </div>

              <Card className="relative overflow-hidden rounded-4xl bg-card/70 border-none max-w-2xl shadow-none">
                <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <CardHeader className="relative">
                  <CardTitle>Operational snapshot</CardTitle>
                  <CardDescription>
                    A quick view of case status and who is actively working.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="rounded-2xl bg-background/55 p-4 ">
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-medium">
                        CASE-1002 · Evidence packet
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                        In progress
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Assignee: Sam</span>
                      <span>Updated minutes ago</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-background/45 p-4 ">
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-medium">
                        CASE-1003 · Signature mismatch
                      </div>
                      <span className="rounded-full bg-white/6 px-2.5 py-1 text-xs text-muted-foreground">
                        Blocked
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Assignee: Jordan</span>
                      <span>Needs client response</span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/4 p-4">
                      <div className="text-sm font-medium">
                        Ownership clarity
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        See who is responsible for each case at a glance.
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/4 p-4">
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
        </div>
      </section>

      <section className="dashboard-main">
        <div className="dashboard-shell-inner">
          <div className="mx-auto container px-4 pb-20 pt-8 sm:px-6">
            <div className="rounded-4xl bg-white/3 p-6  sm:p-8">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Everything you need to run a case workflow
                </h2>
                <p className="max-w-2xl text-muted-foreground">
                  Designed for teams that need consistent intake, transparent
                  ownership, and reliable status reporting.
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <Card className="rounded-3xl bg-card/60">
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
                <Card className="rounded-3xl bg-card/60">
                  <CardHeader>
                    <CardTitle>Clear ownership</CardTitle>
                    <CardDescription>
                      Know who is working on what instantly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Reassign in one click and keep work balanced across the
                    team.
                  </CardContent>
                </Card>
                <Card className="rounded-3xl bg-card/60">
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

              <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl bg-primary/10 p-6  sm:flex-row sm:items-center">
                <div>
                  <div className="text-lg font-semibold tracking-tight">
                    Ready to try it?
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Jump into the dashboard to see the case workflow.
                  </div>
                </div>
                <Button asChild className="rounded-full px-6">
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
