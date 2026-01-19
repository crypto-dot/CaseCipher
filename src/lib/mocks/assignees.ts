import { z } from "zod";

// Privilege schema and type
export const privilegeSchema = z.enum(["user", "admin", "manager", "viewer"]);
export type Privilege = z.infer<typeof privilegeSchema>;

// Assignee schema and type
export const assigneeSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  privilege: privilegeSchema,
});
export type Assignee = z.infer<typeof assigneeSchema>;

// Assignee ID schema (for validation)
export const assigneeIdSchema = z.enum(["1", "2", "3", "4"]);
export type AssigneeId = z.infer<typeof assigneeIdSchema>;

// Mock assignees data
export const mockAssignees: Assignee[] = [
  {
    id: "1",
    firstName: "Alex",
    lastName: "Chen",
    privilege: "admin",
  },
  {
    id: "2",
    firstName: "Jordan",
    lastName: "Williams",
    privilege: "manager",
  },
  {
    id: "3",
    firstName: "Sam",
    lastName: "Rivera",
    privilege: "user",
  },
  {
    id: "4",
    firstName: "Taylor",
    lastName: "Morgan",
    privilege: "user",
  },
];

// Helper to get full name
export function getAssigneeFullName(assignee: Assignee): string {
  return `${assignee.firstName} ${assignee.lastName}`;
}

// Helper to find assignee by id
export function getAssigneeById(id: string): Assignee | undefined {
  return mockAssignees.find((a) => a.id === id);
}

// Helper to get assignees by privilege
export function getAssigneesByPrivilege(privilege: Privilege): Assignee[] {
  return mockAssignees.filter((a) => a.privilege === privilege);
}

// Helper to get assignee full name by id
export function getAssigneeNameById(id: string): string {
  const assignee = mockAssignees.find((a) => a.id === id);
  return assignee ? getAssigneeFullName(assignee) : id;
}