import type { ReactNode } from "react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto container px-4 py-8 sm:px-6">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
