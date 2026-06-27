"use client";

import {
  Activity,
  Database,
  FolderOpen,
  LayoutDashboard,
  Link2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === "/dashboard",
  },
  {
    href: "/dashboard/cases",
    label: "Cases",
    icon: FolderOpen,
    match: (pathname: string) =>
      pathname === "/dashboard/cases" ||
      pathname.startsWith("/dashboard/cases/"),
  },
  {
    href: "/dashboard/evidence",
    label: "Evidence",
    icon: Database,
    match: (pathname: string) => pathname.startsWith("/dashboard/evidence"),
  },
  {
    href: "/dashboard/chain-of-custody",
    label: "Chain of custody",
    icon: Link2,
    match: (pathname: string) =>
      pathname.startsWith("/dashboard/chain-of-custody"),
  },
  {
    href: "/dashboard/activity",
    label: "Activity log",
    icon: Activity,
    match: (pathname: string) => pathname.startsWith("/dashboard/activity"),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    match: (pathname: string) => pathname.startsWith("/dashboard/settings"),
  },
] as const;

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
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { authClient } = await import("@/lib/auth/client");
        const sessionAtom = authClient.useSession;
        if (sessionAtom && typeof sessionAtom === "function") {
          const state = sessionAtom();
          setSession(state?.data ?? null);
        }
      } catch {
        // Auth not configured
      }
    };
    checkSession();
  }, []);

  React.useEffect(() => {
    try {
      setIsCollapsed(
        localStorage.getItem("casecipher:dashboard-sidebar") === "collapsed",
      );
    } catch {
      // ignore
    }
  }, []);

  const mobileNavValue =
    navItems.find((i) => i.match(pathname))?.href ?? navItems[0].href;

  return (
    <aside
      className="dashboard-sidebar p-4 sm:p-5"
      data-collapsed={isCollapsed}
    >
      <div className="relative z-10 flex h-full flex-col gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[hsl(213_94%_55%/0.35)] bg-[hsl(213_94%_55%/0.18)] text-[hsl(213_94%_92%)]">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </div>
          <div className="dashboard-sidebar-copy min-w-0">
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              CaseCipher
            </span>
          </div>
        </Link>

        <div className="md:hidden">
          <Select
            value={mobileNavValue}
            onValueChange={(href) => router.push(href)}
          >
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

        <div className="hidden h-full min-h-0 md:flex md:flex-col">
          <div className="dashboard-sidebar-copy dashboard-rail-label px-1">
            Navigation
          </div>
          <nav className="mt-3 space-y-1.5">
            {navItems.map((i) => {
              const activeItem = i.match(pathname);
              const Icon = i.icon;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  data-active={activeItem}
                  className="dashboard-nav-link"
                  aria-current={activeItem ? "page" : undefined}
                  aria-label={i.label}
                  title={isCollapsed ? i.label : undefined}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="dashboard-nav-icon">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="dashboard-sidebar-copy min-w-0 text-sm font-medium leading-none">
                      {i.label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-5 bg-white/10" />

          {session?.user ? (
            <div className="dashboard-sidebar-copy dashboard-user-panel space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {session.user.image ? (
                    // biome-ignore lint/performance/noImgElement: External OAuth profile images
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {session.user.name || "User"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {session.user.email}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="dashboard-signout -mx-1 h-10 justify-start gap-2 px-3 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              onClick={async () => {
                try {
                  const { authClient } = await import("@/lib/auth/client");
                  await authClient.signOut();
                  setSession(null);
                } catch {
                  // Handle error
                }
              }}
              aria-label="Sign out"
              title={isCollapsed ? "Sign out" : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="dashboard-sidebar-copy">Sign out</span>
            </Button>

            <button
              type="button"
              className="dashboard-collapse-toggle self-center"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={isCollapsed}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => {
                const next = !isCollapsed;
                setIsCollapsed(next);
                try {
                  localStorage.setItem(
                    "casecipher:dashboard-sidebar",
                    next ? "collapsed" : "expanded",
                  );
                } catch {
                  // ignore
                }
              }}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
