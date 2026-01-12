import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur",
        className,
      )}
    >
      <nav
        aria-label="Site header"
        className="mx-auto container flex h-16 items-center justify-between px-4 sm:px-6"
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              CC
            </span>
            <span>CaseCipher</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/about">Learn more</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
