import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <div className="dashboard-shell-inner">
        <div className="dashboard-shell-grid">
          <DashboardNav />
          <main
            className="dashboard-main flex min-h-[calc(100dvh-2.5rem)] flex-col"
            aria-label="Dashboard content"
          >
            <div className="dashboard-content flex min-h-0 flex-1 flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
