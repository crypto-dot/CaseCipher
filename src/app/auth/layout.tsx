import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { authClient } from "@/lib/auth/client";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <SiteHeader />
      <NeonAuthUIProvider authClient={authClient}>
        <main>{children}</main>
      </NeonAuthUIProvider>
      <SiteFooter />
    </div>
  );
}
