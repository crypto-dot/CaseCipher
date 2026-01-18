"use client";

import { NeonAuthUIProvider, UserButton } from "@neondatabase/neon-js/auth/react/ui";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth/client";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      redirectTo="/account/settings"
      emailOTP
    >
                <header className='flex justify-end items-center p-4 gap-4 h-16'>
            <UserButton size="icon" />
          </header>
          {children}
    </NeonAuthUIProvider>
  );
}
