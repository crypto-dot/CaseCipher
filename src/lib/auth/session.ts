import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
};

type SessionPayload = {
  data?: unknown;
  session?: {
    userId?: string;
    user?: Partial<SessionUser>;
  };
  user?: Partial<SessionUser>;
  userId?: string;
};

type AuthWithSession = {
  getSession?: (args?: { headers?: Headers }) => Promise<SessionPayload>;
  api?: {
    getSession?: (args: { headers: Headers }) => Promise<SessionPayload>;
  };
};

export async function requireUser(): Promise<SessionUser> {
  const authClient = auth as AuthWithSession;
  const requestHeaders = await headers();
  const result = authClient.getSession
    ? await authClient.getSession({ headers: requestHeaders })
    : await authClient.api?.getSession?.({ headers: requestHeaders });

  if (!result) {
    throw new Error("Authentication is not configured");
  }

  const payload = (result.data ?? result) as SessionPayload;
  const sessionUser = payload.user ?? payload.session?.user ?? {};
  const id = sessionUser.id ?? payload.session?.userId ?? payload.userId;
  const email = sessionUser.email;

  if (!id || !email) {
    throw new Error("Authentication required");
  }

  return {
    id,
    email,
    name: sessionUser.name ?? undefined,
  };
}
