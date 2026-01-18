"use client";

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react/ui";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      redirectTo="/dashboard"
    >
      {children}
    </NeonAuthUIProvider>
  );
}
