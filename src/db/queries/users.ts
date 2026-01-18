import { and, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import {
  type NewUserProfile,
  type UserProfile,
  type UserRole,
  userProfiles,
} from "@/db/schema";

export interface ListUsersOptions {
  role?: UserRole;
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * List user profiles with optional filters
 */
export async function listUserProfiles(options: ListUsersOptions = {}) {
  const { role, active, search, limit = 100, offset = 0 } = options;

  const conditions = [];

  if (role) {
    conditions.push(eq(userProfiles.role, role));
  }

  if (active !== undefined) {
    conditions.push(eq(userProfiles.active, active));
  }

  if (search) {
    conditions.push(ilike(userProfiles.badgeNumber, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(userProfiles)
    .where(whereClause)
    .limit(limit)
    .offset(offset);
}

/**
 * Get user profile by user ID (from Neon Auth)
 */
export async function getUserProfileByUserId(
  userId: string,
): Promise<UserProfile | null> {
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get user profile by ID
 */
export async function getUserProfileById(
  id: string,
): Promise<UserProfile | null> {
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, id))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create or update user profile (upsert on first login)
 */
export async function upsertUserProfile(
  userId: string,
  data: Partial<Omit<NewUserProfile, "userId">> = {},
): Promise<UserProfile> {
  const existing = await getUserProfileByUserId(userId);

  if (existing) {
    // Update existing profile
    const result = await db
      .update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return result[0];
  }

  // Create new profile with defaults
  const result = await db
    .insert(userProfiles)
    .values({
      userId,
      role: data.role ?? "examiner",
      badgeNumber: data.badgeNumber,
      active: data.active ?? true,
    })
    .returning();

  return result[0];
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, "id" | "userId" | "createdAt">>,
): Promise<UserProfile | null> {
  const result = await db
    .update(userProfiles)
    .set(data)
    .where(eq(userProfiles.userId, userId))
    .returning();

  return result[0] ?? null;
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<UserProfile | null> {
  return updateUserProfile(userId, { role });
}

/**
 * Activate/deactivate user
 */
export async function setUserActive(
  userId: string,
  active: boolean,
): Promise<UserProfile | null> {
  return updateUserProfile(userId, { active });
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserRole) {
  return db
    .select()
    .from(userProfiles)
    .where(and(eq(userProfiles.role, role), eq(userProfiles.active, true)));
}

/**
 * Get all active users (for assignment dropdowns)
 */
export async function getActiveUsers() {
  return db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.active, true))
    .orderBy(userProfiles.badgeNumber);
}
