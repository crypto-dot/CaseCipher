"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setIsAuthenticated(data?.session?.userId != null);
      setIsLoading(false);
    });
  }, []);

  return (
    <header
      className={cn("sticky top-0 z-40 w-full px-3 py-3 sm:px-4", className)}
    >
      <nav
        aria-label="Site header"
        className="mx-auto container flex h-14 items-center justify-between rounded-2xl bg-card/55 px-4 shadow-[0_18px_60px_hsl(222_70%_3%/0.22),inset_0_1px_0_hsl(210_40%_96%/0.06)] backdrop-blur-xl sm:px-5"
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_10px_28px_hsl(var(--primary)/0.28)]">
              CC
            </span>
            <span>CaseCipher</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            // Show placeholder while checking auth
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/sign-out">Sign out</Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
