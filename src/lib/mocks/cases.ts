import type { Case } from "@/lib/types/case-types";

export const MOCK_CREATED_BY = "mock-user";

type MockCaseSeed = Omit<Case, "createdBy" | "createdAt" | "updatedAt">;

const mockCaseSeeds: MockCaseSeed[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    caseNumber: "CASE-1001",
    title: "Intake: Missing documentation",
    clientId: "10000000-0000-4000-8000-000000000001",
    caseType: "Compliance",
    assignedExaminer: "Alex Chen",
    subjectName: "Authorization packet",
    department: "Legal",
    dateReceived: null,
    dateDue: null,
    description:
      "Client: Northwind Logistics. Collect signed authorization and verify incident date.",
    status: "new_case",
    priority: "low",
    incidentDate: null,
    incidentTime: null,
    assignedTo: "1",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    caseNumber: "CASE-1002",
    title: "Review: Evidence packet",
    clientId: "10000000-0000-4000-8000-000000000002",
    caseType: "Security",
    assignedExaminer: "Sam Rivera",
    subjectName: "Evidence packet",
    department: "Operations",
    dateReceived: null,
    dateDue: null,
    description:
      "Client: Contoso Health. Confirm chain-of-custody and mark sensitive attachments.",
    status: "processing",
    priority: "medium",
    incidentDate: null,
    incidentTime: null,
    assignedTo: "3",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    caseNumber: "CASE-1003",
    title: "Client follow-up: Signature mismatch",
    clientId: "10000000-0000-4000-8000-000000000003",
    caseType: "Legal",
    assignedExaminer: "Jordan Williams",
    subjectName: "Signature mismatch",
    department: "Client services",
    dateReceived: null,
    dateDue: null,
    description:
      "Client: Fabrikam Legal. Escalate to client rep and request re-sign within 48h.",
    status: "investigation",
    priority: "high",
    incidentDate: null,
    incidentTime: null,
    assignedTo: "2",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    caseNumber: "CASE-1004",
    title: "Closeout: Final report",
    clientId: "10000000-0000-4000-8000-000000000004",
    caseType: "Other",
    assignedExaminer: "Taylor Morgan",
    subjectName: "Final report",
    department: "Reporting",
    dateReceived: null,
    dateDue: null,
    description:
      "Client: Globex Corp. Export report PDF and notify stakeholders.",
    status: "review",
    priority: "medium",
    incidentDate: null,
    incidentTime: null,
    assignedTo: "4",
  },
];

export function createMockCases(timestamp: string): Case[] {
  return mockCaseSeeds.map((seed) => ({
    ...seed,
    createdBy: MOCK_CREATED_BY,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}
