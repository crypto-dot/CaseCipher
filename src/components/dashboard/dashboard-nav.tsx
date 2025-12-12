"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const active = navItems.find((i) => isActive(pathname, i.href)) ?? navItems[0];

  return (
    <aside className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Dashboard</div>
          <div className="text-xs text-muted-foreground">CaseCypher workspace</div>
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
        <div className="text-xs text-muted-foreground">
          Tip: use <span className="font-mono">New case</span> for full intake details.
        </div>
      </div>
    </aside>
  );
}


