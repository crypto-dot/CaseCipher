export const caseStatuses = ["new", "in_progress", "blocked", "resolved"] as const;
export type CaseStatus = (typeof caseStatuses)[number];

export type CaseItem = {
  id: string;
  title: string;
  client: string;
  description?: string;
  status: CaseStatus;
  assignee: string;
  createdAt: string;
  updatedAt: string;
};

export const teamMembers = ["Alex", "Jordan", "Sam", "Taylor"] as const;
export type TeamMember = (typeof teamMembers)[number];


