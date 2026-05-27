"use server";

import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/db/queries/audit";
import {
  setUserActive as dbSetUserActive,
  updateUserProfile as dbUpdateUserProfile,
  updateUserRole as dbUpdateUserRole,
  getActiveUsers,
  getUserProfileByUserId,
  type ListUsersOptions,
  listUserProfiles,
} from "@/db/queries/users";
import type { UserRole } from "@/lib/types/user-types";
/**
 * List user profiles
 */
export async function listUsers(options?: ListUsersOptions) {
  return listUserProfiles(options);
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string) {
  return getUserProfileByUserId(userId);
}

/**
 * Get all active users (for assignment dropdowns)
 */
export async function getAssignableUsers() {
  return getActiveUsers();
}

/**
 * Update user role
 */
export async function updateUserRole(
  targetUserId: string,
  role: UserRole,
  admin: { id: string; email: string; name?: string },
) {
  const before = await getUserProfileByUserId(targetUserId);
  if (!before) {
    throw new Error("User profile not found");
  }

  const updated = await dbUpdateUserRole(targetUserId, role);
  if (!updated) {
    throw new Error("Failed to update user role");
  }

  // Log the action
  await createAuditLog({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.name,
    action: "user.role_changed",
    entityType: "user",
    entityId: before.id,
    changes: {
      before: { role: before.role },
      after: { role },
      targetUserId,
    },
  });

  revalidatePath("/dashboard/users");

  return updated;
}

/**
 * Activate or deactivate a user
 */
export async function setUserActive(
  targetUserId: string,
  active: boolean,
  admin: { id: string; email: string; name?: string },
) {
  const before = await getUserProfileByUserId(targetUserId);
  if (!before) {
    throw new Error("User profile not found");
  }

  const updated = await dbSetUserActive(targetUserId, active);
  if (!updated) {
    throw new Error("Failed to update user status");
  }

  // Log the action
  await createAuditLog({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.name,
    action: active ? "user.activated" : "user.deactivated",
    entityType: "user",
    entityId: before.id,
    changes: {
      before: { active: before.active },
      after: { active },
      targetUserId,
    },
  });

  revalidatePath("/dashboard/users");

  return updated;
}

/**
 * Update user badge number
 */
export async function updateUserBadge(
  targetUserId: string,
  badgeNumber: string,
  admin: { id: string; email: string; name?: string },
) {
  const before = await getUserProfileByUserId(targetUserId);
  if (!before) {
    throw new Error("User profile not found");
  }

  const updated = await dbUpdateUserProfile(targetUserId, { badgeNumber });
  if (!updated) {
    throw new Error("Failed to update badge number");
  }

  // Log the action
  await createAuditLog({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.name,
    action: "user.badge_updated",
    entityType: "user",
    entityId: before.id,
    changes: {
      before: { badgeNumber: before.badgeNumber },
      after: { badgeNumber },
      targetUserId,
    },
  });

  revalidatePath("/dashboard/users");

  return updated;
}
