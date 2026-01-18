"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { authClient } = await import("@/lib/auth");
        const sessionAtom = authClient.useSession;

        if (sessionAtom && typeof sessionAtom.get === "function") {
          const state = sessionAtom.get();
          
          if (state?.data?.user) {
            setIsAuthenticated(true);
            setIsChecking(false);
            return;
          }
        }

        // Subscribe to session changes
        if (sessionAtom && typeof sessionAtom.subscribe === "function") {
          const unsubscribe = sessionAtom.subscribe((state) => {
            if (state?.data?.user) {
              setIsAuthenticated(true);
              setIsChecking(false);
            } else if (!state?.isPending) {
              // No user and not loading - redirect to sign in
              router.replace("/auth/sign-in");
            }
          });

          // Give it a moment to load
          setTimeout(() => {
            const currentState = sessionAtom.get?.();
            if (!currentState?.data?.user && !currentState?.isPending) {
              router.replace("/auth/sign-in");
            }
          }, 1500);

          return () => unsubscribe?.();
        }

        // Fallback: redirect if no session mechanism found
        router.replace("/auth/sign-in");
      } catch {
        // Auth not configured - redirect to sign in
        router.replace("/auth/sign-in");
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
