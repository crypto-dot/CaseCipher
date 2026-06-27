import { relations } from "drizzle-orm/relations";
import {
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

export const personnelRelations = relations(personnel, ({ many }) => ({
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
    references: [personnel.id],
  }),
  custodyEvents: many(custodyEvents),
}));

export const custodyEventsRelations = relations(custodyEvents, ({ one }) => ({
  evidence: one(evidence, {
    fields: [custodyEvents.evidenceId],
    references: [evidence.id],
  }),
  fromCustodianPerson: one(personnel, {
    fields: [custodyEvents.fromCustodian],
    references: [personnel.id],
    relationName: "fromCustodian",
  }),
  toCustodianPerson: one(personnel, {
    fields: [custodyEvents.toCustodian],
    references: [personnel.id],
    relationName: "toCustodian",
  }),
  recordedByPerson: one(personnel, {
    fields: [custodyEvents.recordedBy],
    references: [personnel.id],
    relationName: "recordedBy",
  }),
}));
