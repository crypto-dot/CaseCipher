import { relations } from "drizzle-orm/relations";
import { userInNeonAuth } from "./neon-auth-user";
import {
  attachments,
  caseNotes,
  cases,
  clients,
  custodyEvents,
  evidence,
  personnel,
} from "./schema";

export const casesRelations = relations(cases, ({ one, many }) => ({
  client: one(clients, {
    fields: [cases.clientId],
    references: [clients.id],
  }),
  caseNotes: many(caseNotes),
  evidences: many(evidence),
  attachments: many(attachments),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  cases: many(cases),
}));

export const caseNotesRelations = relations(caseNotes, ({ one }) => ({
  case: one(cases, {
    fields: [caseNotes.caseId],
    references: [cases.id],
  }),
}));

export const personnelRelations = relations(personnel, ({ one, many }) => ({
  user: one(userInNeonAuth, {
    fields: [personnel.userId],
    references: [userInNeonAuth.id],
  }),
  evidenceAsCustodian: many(evidence),
  custodyEventsFrom: many(custodyEvents, { relationName: "fromCustodian" }),
  custodyEventsTo: many(custodyEvents, { relationName: "toCustodian" }),
  custodyEventsRecorded: many(custodyEvents, { relationName: "recordedBy" }),
}));

export const evidenceRelations = relations(evidence, ({ one, many }) => ({
  case: one(cases, {
    fields: [evidence.caseId],
    references: [cases.id],
  }),
  currentCustodianPerson: one(personnel, {
    fields: [evidence.currentCustodian],
    references: [personnel.userId],
  }),
  custodyEvents: many(custodyEvents),
  attachments: many(attachments),
}));

export const custodyEventsRelations = relations(custodyEvents, ({ one }) => ({
  evidence: one(evidence, {
    fields: [custodyEvents.evidenceId],
    references: [evidence.id],
  }),
  fromCustodianPerson: one(personnel, {
    fields: [custodyEvents.fromCustodian],
    references: [personnel.userId],
    relationName: "fromCustodian",
  }),
  toCustodianPerson: one(personnel, {
    fields: [custodyEvents.toCustodian],
    references: [personnel.userId],
    relationName: "toCustodian",
  }),
  recordedByPerson: one(personnel, {
    fields: [custodyEvents.recordedBy],
    references: [personnel.userId],
    relationName: "recordedBy",
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  case: one(cases, {
    fields: [attachments.caseId],
    references: [cases.id],
  }),
  evidence: one(evidence, {
    fields: [attachments.evidenceId],
    references: [evidence.id],
  }),
}));
