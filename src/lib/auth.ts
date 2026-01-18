import { createAuthClient } from "@neondatabase/neon-js/auth";

// Auth URL is required in production but optional during build
const authUrl =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL || "https://placeholder.auth.neon.tech";

export const authClient = createAuthClient(authUrl);

// Re-export hooks for convenience
export const useSession = () => {
  // The authClient exposes session as a reactive store
  // This is a simple wrapper that works in React
  const session = authClient.useSession;
  return session;
};

export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
