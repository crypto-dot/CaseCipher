"use server";

import { cookies, headers } from "next/headers";
import { getUserProfileByUserId, upsertUserProfile } from "@/db/queries/users";
import type { UserRole } from "@/db/schema";

// Type for the session user from Neon Auth
interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get the current session from cookies
 * This reads the Neon Auth session cookie and validates it
 */
export async function getCurrentSession(): Promise<SessionUser | null> {
  // Note: In production, this would validate the session token with Neon Auth
  // For now, we'll use a simplified approach
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("neon_auth_session");

  if (!sessionToken) {
    return null;
  }

  // In production, validate the token with Neon Auth API
  // For development, we'll decode it if it's a JWT or return null
  return null;
}

/**
 * Get current user with their profile
 */
export async function getCurrentUserWithProfile() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const profile = await getUserProfileByUserId(session.id);

  return {
    ...session,
    profile,
  };
}

/**
 * Ensure user has a profile (called on first login)
 */
export async function ensureUserProfile(
  userId: string,
  defaults?: { role?: UserRole; badgeNumber?: string },
) {
  return upsertUserProfile(userId, defaults);
}

/**
 * Get client IP address from headers
 */
export async function getClientIp(): Promise<string | undefined> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    undefined
  );
}
