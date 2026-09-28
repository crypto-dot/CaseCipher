import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { userInNeonAuth } from "@/db/neon-auth-user";
import { personnel, userRole } from "@/db/schema";
import type { UserRole } from "@/lib/types/user-types";

export interface ListUsersOptions {
  role?: UserRole;
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

const personnelWithUser = {
  userId: personnel.userId,
  badgeNumber: personnel.badgeNumber,
  role: personnel.role,
  isActive: personnel.isActive,
  createdAt: personnel.createdAt,
  updatedAt: personnel.updatedAt,
  name: userInNeonAuth.name,
  email: userInNeonAuth.email,
};

export type PersonnelWithUser = {
  userId: string;
  badgeNumber: string | null;
  role: (typeof userRole.enumValues)[number];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name: string | null;
  email: string | null;
};

/**
 * List personnel with Neon Auth identity and optional filters
 */
export async function listUserProfiles(
  options: ListUsersOptions = {},
): Promise<PersonnelWithUser[]> {
  const { role, active, search, limit = 100, offset = 0 } = options;

  const conditions = [];

  if (role) {
    conditions.push(
      eq(personnel.role, role as (typeof userRole.enumValues)[number]),
    );
  }

  if (active !== undefined) {
    conditions.push(eq(personnel.isActive, active));
  }

  if (search) {
    conditions.push(
      or(
        ilike(personnel.badgeNumber, `%${search}%`),
        ilike(userInNeonAuth.name, `%${search}%`),
        ilike(userInNeonAuth.email, `%${search}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select(personnelWithUser)
    .from(personnel)
    .leftJoin(userInNeonAuth, eq(personnel.userId, userInNeonAuth.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);
}

/**
 * Get personnel by Neon Auth user ID
 */
export async function getUserProfileByUserId(
  userId: string,
): Promise<PersonnelWithUser | null> {
  const result = await db
    .select(personnelWithUser)
    .from(personnel)
    .leftJoin(userInNeonAuth, eq(personnel.userId, userInNeonAuth.id))
    .where(eq(personnel.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get personnel by user ID (personnel PK is the Neon Auth user id)
 */
export async function getUserProfileById(
  id: string,
): Promise<PersonnelWithUser | null> {
  return getUserProfileByUserId(id);
}

/**
 * Create or update personnel (upsert on first login)
 */
export async function upsertUserProfile(
  userId: string,
  data: Partial<Omit<typeof personnel.$inferInsert, "userId">> = {},
): Promise<typeof personnel.$inferSelect> {
  const existing = await db
    .select()
    .from(personnel)
    .where(eq(personnel.userId, userId))
    .limit(1);

  if (existing[0]) {
    const result = await db
      .update(personnel)
      .set(data)
      .where(eq(personnel.userId, userId))
      .returning();
    return result[0];
  }

  const result = await db
    .insert(personnel)
    .values({
      userId,
      role: data.role ?? userRole.enumValues[3],
      badgeNumber: data.badgeNumber,
      isActive: data.isActive ?? true,
    })
    .returning();

  return result[0];
}

/**
 * Update personnel extras
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<typeof personnel.$inferSelect, "userId" | "createdAt">>,
): Promise<typeof personnel.$inferSelect | null> {
  const result = await db
    .update(personnel)
    .set(data)
    .where(eq(personnel.userId, userId))
    .returning();

  return result[0] ?? null;
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<typeof personnel.$inferSelect | null> {
  return updateUserProfile(userId, { role });
}

/**
 * Activate/deactivate user
 */
export async function setUserActive(
  userId: string,
  active: boolean,
): Promise<typeof personnel.$inferSelect | null> {
  return updateUserProfile(userId, { isActive: active });
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserRole) {
  return db
    .select(personnelWithUser)
    .from(personnel)
    .leftJoin(userInNeonAuth, eq(personnel.userId, userInNeonAuth.id))
    .where(
      and(
        eq(personnel.role, role as (typeof userRole.enumValues)[number]),
        eq(personnel.isActive, true),
      ),
    );
}

/**
 * Get all active users (for assignment dropdowns)
 */
export async function getActiveUsers() {
  return db
    .select(personnelWithUser)
    .from(personnel)
    .leftJoin(userInNeonAuth, eq(personnel.userId, userInNeonAuth.id))
    .where(eq(personnel.isActive, true))
    .orderBy(personnel.badgeNumber);
}
