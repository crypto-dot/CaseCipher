"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { signOutAction } from "@/lib/auth/signOut";
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
  const handleSignOut = async () => {
    try {
      await signOutAction();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthenticated(false);
    }
  };
  return (
    <header
      className={cn("sticky top-0 z-40 w-full px-3 py-3 sm:px-4", className)}
    >
      <nav
        aria-label="Site header"
        className="mx-auto container flex h-14 items-center justify-between rounded-2xl bg-card/55 px-4  backdrop-blur-xl sm:px-5"
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground ">
              CC
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            // Show placeholder while checking auth
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <>
              <Button onClick={handleSignOut} size="lg" variant="outline">
                Sign out
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
