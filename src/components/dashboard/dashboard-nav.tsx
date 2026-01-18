"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/cases/new", label: "New case" },
  { href: "/dashboard/users", label: "User management" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { authClient } = await import("@/lib/auth");
        const sessionAtom = authClient.useSession;
        if (sessionAtom && typeof sessionAtom.get === "function") {
          const state = sessionAtom.get();
          setSession(state?.data ?? null);
        }
      } catch {
        // Auth not configured
      }
    };
    checkSession();
  }, []);

  const active =
    navItems.find((i) => isActive(pathname, i.href)) ?? navItems[0];

  return (
    <aside className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Dashboard</div>
          <div className="text-xs text-muted-foreground">
            CaseCipher workspace
          </div>
        </div>
        <Badge variant="outline" className="hidden md:inline-flex">
          Menu
        </Badge>
      </div>

      {/* Mobile: dropdown nav */}
      <div className="md:hidden">
        <Select value={active.href} onValueChange={(href) => router.push(href)}>
          <SelectTrigger>
            <SelectValue placeholder="Navigate" />
          </SelectTrigger>
          <SelectContent>
            {navItems.map((i) => (
              <SelectItem key={i.href} value={i.href}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: sidebar */}
      <div className="hidden md:block">
        <nav className="space-y-1">
          {navItems.map((i) => {
            const activeItem = isActive(pathname, i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  activeItem
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>{i.label}</span>
              </Link>
            );
          })}
        </nav>
        <Separator className="my-4" />

        {/* User info */}
        {session?.user && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                {session.user.image ? (
                  // biome-ignore lint/performance/noImgElement: External OAuth profile images
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {session.user.name || "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={async () => {
                try {
                  const { authClient } = await import("@/lib/auth");
                  await authClient.signOut();
                  setSession(null);
                } catch {
                  // Handle error
                }
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        )}

        <Separator className="my-4" />
        <div className="text-xs text-muted-foreground">
          Tip: use <span className="font-mono">New case</span> for full intake
          details.
        </div>
      </div>
    </aside>
  );
}
