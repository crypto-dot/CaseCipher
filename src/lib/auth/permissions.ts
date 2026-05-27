
import type { UserRole } from "@/lib/types/user-types";
/**
 * Permission definitions for CaseCipher RBAC
 */

export const PERMISSIONS = {
  // Case permissions
  "cases:read": "Read case details",
  "cases:write": "Create and update cases",
  "cases:delete": "Delete cases",
  "cases:assign": "Assign cases to users",

  // Evidence permissions
  "evidence:read": "View evidence",
  "evidence:write": "Upload and modify evidence",
  "evidence:delete": "Delete evidence",

  // Client permissions
  "clients:read": "View client information",
  "clients:write": "Create and update clients",
  "clients:delete": "Delete clients",

  // User management
  "users:read": "View user list",
  "users:manage": "Manage user roles and permissions",

  // System
  "system:settings": "Access system settings",
  "audit:read": "View audit logs",
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Role-based permission mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  "admin": [
    "cases:read",
    "cases:write",
    "cases:delete",
    "cases:assign",
    "evidence:read",
    "evidence:write",
    "evidence:delete",
    "clients:read",
    "clients:write",
    "clients:delete",
    "users:read",
    "users:manage",
    "system:settings",
    "audit:read",
  ],
  "manager": [
    "cases:read",
    "cases:write",
    "cases:assign",
    "evidence:read",
    "evidence:write",
    "clients:read",
    "clients:write",
    "users:read",
    "audit:read",
  ],
  "analyst": [
    "cases:read",
    "cases:write",
    "evidence:read",
    "evidence:write",
    "clients:read",
  ],
  "examiner": ["cases:read", "evidence:read", "clients:read"],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if user can access a case based on assignment or role
 */
export function canAccessCase(
  userRole: UserRole,
  userId: string,
  caseAssignedTo: string | null,
  caseCreatedBy: string,
): boolean {
  // Admins and managers can access all cases
  if (userRole === "admin" || userRole === "manager") {
    return true;
  }

  // Analysts and examiners can only access assigned cases or ones they created
  return caseAssignedTo === userId || caseCreatedBy === userId;
}

/**
 * Check if user can modify a case
 */
export function canModifyCase(
  userRole: UserRole,
  userId: string,
  caseAssignedTo: string | null,
  caseCreatedBy: string,
): boolean {
  // Must have write permission
  if (!hasPermission(userRole, "cases:write")) {
    return false;
  }

  // Admins and managers can modify all cases
  if (userRole === "admin" || userRole === "manager") {
    return true;
  }

  // Others can only modify assigned or created cases
  return caseAssignedTo === userId || caseCreatedBy === userId;
}

/**
 * Role hierarchy for display/comparison
 */
export const ROLE_HIERARCHY: UserRole[] = [
  "examiner",
  "analyst",
  "manager",
  "admin",
];

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: "Administrator",
    manager: "Manager",
    analyst: "Analyst",
    examiner: "Examiner",
  };
  return names[role];
}
