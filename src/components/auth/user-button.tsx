"use client";

import { LogOut, User } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";

interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function UserButton() {
  const [session, setSession] = React.useState<UserSession | null>(null);
  const [isPending, setIsPending] = React.useState(true);

  React.useEffect(() => {
    // Check for session from Neon Auth
    // This will be populated when Neon Auth is configured
    const checkSession = async () => {
      try {
        // Import auth client dynamically to avoid build errors
        const { authClient } = await import("@/lib/auth");
        const sessionAtom = authClient.useSession;

        // Try to get session state
        if (sessionAtom && typeof sessionAtom.get === "function") {
          const state = sessionAtom.get();
          setSession(state?.data ?? null);
        }
      } catch {
        // Auth not configured yet
      } finally {
        setIsPending(false);
      }
    };

    checkSession();
  }, []);

  if (isPending) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="/auth/sign-in">Sign In</a>
      </Button>
    );
  }

  const handleSignOut = async () => {
    try {
      const { authClient } = await import("@/lib/auth");
      await authClient.signOut();
      setSession(null);
    } catch {
      // Handle sign out error
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {session.user.image ? (
            // biome-ignore lint/performance/noImgElement: External OAuth profile images
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <span className="hidden sm:inline-block font-medium">
          {session.user.name || session.user.email}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
