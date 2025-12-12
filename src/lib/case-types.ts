export const caseStatuses = ["new", "in_progress", "blocked", "resolved"] as const;
export type CaseStatus = (typeof caseStatuses)[number];

export const casePriorities = ["low", "medium", "high"] as const;
export type CasePriority = (typeof casePriorities)[number];

export type CaseAttachment = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

export type CaseItem = {
  id: string;
  title: string;
  client: string;
  description?: string;
  status: CaseStatus;
  assignee: string;
  priority?: CasePriority;
  incidentDate?: string; // YYYY-MM-DD
  incidentTime?: string; // HH:mm
  attachments?: CaseAttachment[];
  createdAt: string;
  updatedAt: string;
};

export const teamMembers = ["Alex", "Jordan", "Sam", "Taylor"] as const;
export type TeamMember = (typeof teamMembers)[number];


