"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type UserRole = "Examiner" | "Analyst" | "Admin";
type Permission =
  | "cases:read"
  | "cases:write"
  | "evidence:read"
  | "evidence:write"
  | "users:manage"
  | "system:settings";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  badgeNumber: string;
  role: UserRole;
  permissions: Permission[];
  active: boolean;
  createdAt: string;
};

const STORAGE_KEY = "casecypher.users.v1";

const ALL_PERMISSIONS: Permission[] = [
  "cases:read",
  "cases:write",
  "evidence:read",
  "evidence:write",
  "users:manage",
  "system:settings",
];

const ROLE_DEFAULTS: Record<UserRole, Permission[]> = {
  Examiner: ["cases:read", "evidence:read"],
  Analyst: ["cases:read", "cases:write", "evidence:read", "evidence:write"],
  Admin: ["cases:read", "cases:write", "evidence:read", "evidence:write", "users:manage", "system:settings"],
};

function safeUuid() {
  try {
    return crypto.randomUUID();
  } catch {
    return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  }
}

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

function isValidEmail(input: string) {
  const v = normalizeEmail(input);
  // intentionally simple; this is just UI validation
  return v.includes("@") && v.includes(".");
}

function uniquePermissions(perms: Permission[]) {
  return Array.from(new Set(perms));
}

function roleBadgeVariant(role: UserRole) {
  switch (role) {
    case "Admin":
      return "destructive" as const;
    case "Analyst":
      return "secondary" as const;
    case "Examiner":
    default:
      return "outline" as const;
  }
}

function statusBadgeVariant(active: boolean) {
  return active ? ("secondary" as const) : ("outline" as const);
}

function permissionLabel(p: Permission) {
  const [domain, action] = p.split(":");
  return `${domain} · ${action}`;
}

function loadUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as UserRecord[];
  } catch {
    return [];
  }
}

function saveUsers(users: UserRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore persistence issues in UI-only admin page
  }
}

const SEEDED_USERS: UserRecord[] = [
  {
    id: "seed_admin",
    name: "Jordan Admin",
    email: "jordan.admin@example.com",
    badgeNumber: "A-0001",
    role: "Admin",
    permissions: ROLE_DEFAULTS.Admin,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed_examiner",
    name: "Riley Examiner",
    email: "riley.examiner@example.com",
    badgeNumber: "E-0142",
    role: "Examiner",
    permissions: ROLE_DEFAULTS.Examiner,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export function UserManagementClient() {
  const [users, setUsers] = useState<UserRecord[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Examiner");
  const [customizeNewPermissions, setCustomizeNewPermissions] = useState(false);
  const [newPermissions, setNewPermissions] = useState<Permission[]>(ROLE_DEFAULTS.Examiner);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadUsers();
    if (existing.length > 0) {
      setUsers(existing);
      return;
    }
    setUsers(SEEDED_USERS);
  }, []);

  useEffect(() => {
    if (users.length === 0) return;
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    if (!customizeNewPermissions) {
      setNewPermissions(ROLE_DEFAULTS[newRole]);
    }
  }, [newRole, customizeNewPermissions]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => (roleFilter === "All" ? true : u.role === roleFilter))
      .filter((u) => {
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.badgeNumber.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, roleFilter, search]);

  function updateUser(id: string, updater: (u: UserRecord) => UserRecord) {
    setUsers((prev) => prev.map((u) => (u.id === id ? updater(u) : u)));
  }

  function togglePermission(perms: Permission[], p: Permission) {
    return perms.includes(p) ? perms.filter((x) => x !== p) : [...perms, p];
  }

  function onAddUser() {
    setError(null);

    const name = newName.trim();
    const email = normalizeEmail(newEmail);
    const badgeNumber = newBadge.trim();

    if (!name) return setError("Name is required.");
    if (!email || !isValidEmail(email)) return setError("Enter a valid email address.");
    if (!badgeNumber) return setError("Badge number is required.");

    const emailTaken = users.some((u) => u.email.toLowerCase() === email);
    if (emailTaken) return setError("A user with that email already exists.");

    const badgeTaken = users.some((u) => u.badgeNumber.toLowerCase() === badgeNumber.toLowerCase());
    if (badgeTaken) return setError("A user with that badge number already exists.");

    const permissions = uniquePermissions(customizeNewPermissions ? newPermissions : ROLE_DEFAULTS[newRole]);
    if (permissions.length === 0) return setError("Select at least one permission.");

    const record: UserRecord = {
      id: safeUuid(),
      name,
      email,
      badgeNumber,
      role: newRole,
      permissions,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [record, ...prev]);
    setNewName("");
    setNewEmail("");
    setNewBadge("");
    setNewRole("Examiner");
    setCustomizeNewPermissions(false);
    setNewPermissions(ROLE_DEFAULTS.Examiner);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-semibold tracking-tight">User Management</div>
        <div className="text-sm text-muted-foreground">
          Create users, assign roles/permissions, and deactivate access. (Admin enforcement is handled elsewhere.)
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add user</CardTitle>
            <CardDescription>Basic profile + role/permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="newName">Name</Label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Alex Rivera"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="newEmail">Email</Label>
                <Input
                  id="newEmail"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="alex.rivera@agency.gov"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newBadge">Badge #</Label>
                <Input
                  id="newBadge"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  placeholder="e.g., E-1027"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Examiner">Examiner</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">Permissions</div>
                  <div className="text-xs text-muted-foreground">
                    Default permissions are assigned from the selected role unless you customize them.
                  </div>
                </div>
                <label className="flex select-none items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={customizeNewPermissions}
                    onChange={(e) => setCustomizeNewPermissions(e.target.checked)}
                  />
                  Customize
                </label>
              </div>

              <div className="rounded-md border bg-muted/20 p-3">
                <div className="flex flex-wrap gap-2">
                  {(customizeNewPermissions ? newPermissions : ROLE_DEFAULTS[newRole]).map((p) => (
                    <Badge key={p} variant="outline">
                      {p}
                    </Badge>
                  ))}
                  {(customizeNewPermissions ? newPermissions : ROLE_DEFAULTS[newRole]).length === 0 ? (
                    <span className="text-sm text-muted-foreground">No permissions selected.</span>
                  ) : null}
                </div>
              </div>

              {customizeNewPermissions ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={newPermissions.includes(p)}
                        onChange={() => setNewPermissions((prev) => togglePermission(prev, p))}
                      />
                      <span className="font-medium">{permissionLabel(p)}</span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">{p}</span>
                    </label>
                  ))}
                  <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewPermissions(ROLE_DEFAULTS[newRole])}
                    >
                      Reset to role defaults
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" onClick={onAddUser}>
                Add user
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage roles, permissions, and activation status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="searchUsers">Search</Label>
                <Input
                  id="searchUsers"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, email, badge…"
                />
              </div>
              <div className="w-full space-y-2 sm:w-56">
                <Label>Role filter</Label>
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "All")}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Examiner">Examiner</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="hidden grid-cols-[1.2fr_1fr_0.6fr_0.8fr_0.6fr] gap-3 px-2 text-xs text-muted-foreground md:grid">
                <div>User</div>
                <div>Badge</div>
                <div>Role</div>
                <div>Permissions</div>
                <div className="text-right">Actions</div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="rounded-md border p-6 text-sm text-muted-foreground">No users found.</div>
              ) : null}

              {filteredUsers.map((u) => {
                const isExpanded = expandedUserId === u.id;
                return (
                  <div key={u.id} className="rounded-md border">
                    <div className="grid gap-3 p-3 md:grid-cols-[1.2fr_1fr_0.6fr_0.8fr_0.6fr] md:items-center">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={cn("truncate text-sm font-medium", !u.active && "text-muted-foreground")}>
                            {u.name}
                          </div>
                          <Badge variant={statusBadgeVariant(u.active)}>{u.active ? "Active" : "Inactive"}</Badge>
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                      </div>

                      <div className="text-sm md:text-xs">
                        <div className="md:hidden text-xs text-muted-foreground">Badge</div>
                        <div className="font-mono">{u.badgeNumber}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="md:hidden text-xs text-muted-foreground">Role</div>
                        <Select
                          value={u.role}
                          onValueChange={(v) => {
                            const role = v as UserRole;
                            updateUser(u.id, (prev) => ({
                              ...prev,
                              role,
                              permissions: uniquePermissions(role === prev.role ? prev.permissions : ROLE_DEFAULTS[role]),
                            }));
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Examiner">Examiner</SelectItem>
                            <SelectItem value="Analyst">Analyst</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="hidden md:block">
                          <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                        </div>
                      </div>

                      <div className="text-sm md:text-xs">
                        <div className="md:hidden text-xs text-muted-foreground">Permissions</div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline">{u.permissions.length} total</Badge>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs"
                            onClick={() => setExpandedUserId((cur) => (cur === u.id ? null : u.id))}
                          >
                            {isExpanded ? "Hide" : "Edit"}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <Button
                          type="button"
                          variant={u.active ? "destructive" : "secondary"}
                          className="w-full md:w-auto"
                          onClick={() => updateUser(u.id, (prev) => ({ ...prev, active: !prev.active }))}
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="border-t p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-medium">Permissions for {u.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Role defaults:{" "}
                              <span className="font-mono">{ROLE_DEFAULTS[u.role].join(", ")}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => updateUser(u.id, (prev) => ({ ...prev, permissions: ROLE_DEFAULTS[prev.role] }))}
                            >
                              Reset to role defaults
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {ALL_PERMISSIONS.map((p) => (
                            <label key={p} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                checked={u.permissions.includes(p)}
                                onChange={() =>
                                  updateUser(u.id, (prev) => ({
                                    ...prev,
                                    permissions: uniquePermissions(togglePermission(prev.permissions, p)),
                                  }))
                                }
                              />
                              <span className="font-medium">{permissionLabel(p)}</span>
                              <span className="ml-auto font-mono text-xs text-muted-foreground">{p}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


