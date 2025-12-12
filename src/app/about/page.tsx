import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="mx-auto container px-4 py-14 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-6">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            About CaseCypher
          </h1>
          <p className="max-w-2xl text-pretty text-lg leading-7 text-muted-foreground">
            CaseCypher is a modern case management service built for teams that need speed,
            accountability, and a clean source of truth. It keeps status, ownership, and key details
            in one place—so work moves forward without ambiguity.
          </p>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ownership-first workflow</CardTitle>
                <CardDescription>Every case has a clear assignee.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Avoid handoff confusion—see who’s responsible and when it last changed.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status visibility</CardTitle>
                <CardDescription>Make progress measurable.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Use consistent statuses to identify blocked work and accelerate resolution.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Validated intake</CardTitle>
                <CardDescription>Guardrails for quality inputs.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                RHF + Zod means required fields are enforced and errors are readable.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Extensible foundation</CardTitle>
                <CardDescription>Ready for real APIs later.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                React Query powers async data access now, and will translate cleanly to backend calls.
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Try the dashboard</CardTitle>
            <CardDescription>See status and ownership in action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to landing</Link>
            </Button>
            <p className="pt-2 text-xs text-muted-foreground">
              This demo uses localStorage as a temporary “backend”.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


