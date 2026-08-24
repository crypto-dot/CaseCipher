import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  foreignKey,
  index,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const neonAuth = pgSchema("neon_auth");
export const casePriority = pgEnum("case_priority", ["low", "medium", "high"]);
export const caseStatus = pgEnum("case_status", [
  "new_case",
  "intake",
  "processing",
  "investigation",
  "report",
  "review",
]);
export const userRole = pgEnum("user_role", [
  "admin",
  "manager",
  "analyst",
  "examiner",
]);

const _invitationInNeonAuth = neonAuth.table(
  "invitation",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    organizationId: uuid().notNull(),
    email: text().notNull(),
    role: text(),
    status: text().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    inviterId: uuid().notNull(),
  },
  (table) => [
    index("invitation_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    index("invitation_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationInNeonAuth.id],
      name: "invitation_organizationId_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [userInNeonAuth.id],
      name: "invitation_inviterId_fkey",
    }).onDelete("cascade"),
  ],
);

const userInNeonAuth = neonAuth.table(
  "user",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [unique("user_email_key").on(table.email)],
);

const _sessionInNeonAuth = neonAuth.table(
  "session",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: uuid().notNull(),
    impersonatedBy: text(),
    activeOrganizationId: text(),
  },
  (table) => [
    index("session_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInNeonAuth.id],
      name: "session_userId_fkey",
    }).onDelete("cascade"),
    unique("session_token_key").on(table.token),
  ],
);

const organizationInNeonAuth = neonAuth.table(
  "organization",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    logo: text(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    metadata: text(),
  },
  (table) => [
    uniqueIndex("organization_slug_uidx").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
    ),
    unique("organization_slug_key").on(table.slug),
  ],
);

const _accountInNeonAuth = neonAuth.table(
  "account",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: uuid().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true, mode: "string" }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: "string" }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    index("account_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInNeonAuth.id],
      name: "account_userId_fkey",
    }).onDelete("cascade"),
  ],
);

const _verificationInNeonAuth = neonAuth.table(
  "verification",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").using(
      "btree",
      table.identifier.asc().nullsLast().op("text_ops"),
    ),
  ],
);

const _jwksInNeonAuth = neonAuth.table("jwks", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  publicKey: text().notNull(),
  privateKey: text().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  expiresAt: timestamp({ withTimezone: true, mode: "string" }),
});

export const memberInNeonAuth = neonAuth.table(
  "member",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    organizationId: uuid().notNull(),
    userId: uuid().notNull(),
    role: text().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    index("member_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("uuid_ops"),
    ),
    index("member_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizationInNeonAuth.id],
      name: "member_organizationId_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [userInNeonAuth.id],
      name: "member_userId_fkey",
    }).onDelete("cascade"),
  ],
);

const _projectConfigInNeonAuth = neonAuth.table(
  "project_config",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    endpointId: text("endpoint_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    trustedOrigins: jsonb("trusted_origins").notNull(),
    socialProviders: jsonb("social_providers").notNull(),
    emailProvider: jsonb("email_provider"),
    emailAndPassword: jsonb("email_and_password"),
    allowLocalhost: boolean("allow_localhost").notNull(),
  },
  (table) => [unique("project_config_endpoint_id_key").on(table.endpointId)],
);

export const auditLog = pgTable("audit_log", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  userName: text("user_name"),
  action: text().notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  changes: jsonb(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").references(() => userInNeonAuth.id, {
      onDelete: "cascade",
    }),
    badgeNumber: text("badge_number"),
    role: userRole().default("examiner").notNull(),
    active: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("user_profiles_user_id_unique").on(table.userId),
    unique("user_profiles_badge_number_unique").on(table.badgeNumber),
  ],
);

export const cases = pgTable(
  "cases",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    caseNumber: text("case_number"),
    title: text().notNull(),
    clientId: uuid("client_id"),
    caseType: text("case_type"),
    requestor: text(),
    assignedExaminer: text("assigned_examiner"),
    subjectName: text("subject_name"),
    department: text(),
    dateReceived: date("date_received"),
    dateDue: date("date_due"),
    description: text(),
    status: caseStatus().default("new_case").notNull(),
    priority: casePriority().default("medium"),
    incidentDate: date("incident_date"),
    incidentTime: time("incident_time"),
    assignedTo: text("assigned_to"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: "cases_client_id_clients_id_fk",
    }).onDelete("set null"),
    unique("cases_case_number_unique").on(table.caseNumber),
  ],
);

export const caseNotes = pgTable(
  "case_notes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    caseId: uuid("case_id").notNull(),
    content: text().notNull(),
    authorId: text("author_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.caseId],
      foreignColumns: [cases.id],
      name: "case_notes_case_id_cases_id_fk",
    }).onDelete("cascade"),
  ],
);

export const clients = pgTable("clients", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text(),
  notes: text(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const personnel = pgTable(
  "personnel",
  {
    id: uuid("person_id").defaultRandom().primaryKey().notNull(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    badgeOrEmployeeId: varchar("badge_or_employee_id", { length: 50 }),
    organization: varchar({ length: 100 }),
    role: varchar({ length: 50 }),
    email: varchar({ length: 150 }),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    unique("personnel_badge_or_employee_id_unique").on(table.badgeOrEmployeeId),
  ],
);

export const evidence = pgTable(
  "evidence",
  {
    id: uuid("evidence_id").defaultRandom().primaryKey().notNull(),
    caseId: uuid("case_id").notNull(),
    evidenceNumber: varchar("evidence_number", { length: 50 }),
    label: varchar({ length: 100 }).notNull(),
    description: text(),
    evidenceType: varchar("evidence_type", { length: 50 }),
    dateSeized: date("date_seized"),
    make: varchar({ length: 100 }),
    model: varchar({ length: 100 }),
    serialNumber: varchar("serial_number", { length: 120 }),
    storageLocation: varchar("storage_location", { length: 255 }),
    seizedBy: varchar("seized_by", { length: 120 }),
    acquisitionMethod: varchar("acquisition_method", { length: 50 }),
    acquisitionTool: varchar("acquisition_tool", { length: 120 }),
    media:
      jsonb().$type<
        Array<{
          name: string;
          size: number;
          type: string;
          lastModified: number;
        }>
      >(),
    collectedAt: timestamp("collected_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    collectionLocation: text("collection_location"),
    hashMd5: varchar("hash_md5", { length: 32 }),
    hashSha256: varchar("hash_sha256", { length: 64 }),
    hashSha512: varchar("hash_sha512", { length: 128 }),
    currentLocation: varchar("current_location", { length: 255 }),
    currentCustodian: uuid("current_custodian").references(() => personnel.id),
    status: varchar({ length: 30 }).default("active"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.caseId],
      foreignColumns: [cases.id],
      name: "evidence_case_id_cases_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.currentCustodian],
      foreignColumns: [personnel.id],
      name: "evidence_current_custodian_personnel_id_fk",
    }).onDelete("set null"),
  ],
);

export const attachments = pgTable(
  "attachments",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    caseId: uuid("case_id").notNull(),
    evidenceId: uuid("evidence_id"),
    pathname: text().notNull(),
    url: text().notNull(),
    downloadUrl: text("download_url"),
    filename: text().notNull(),
    contentType: text("content_type").notNull(),
    size: bigint({ mode: "number" }).notNull(),
    sha256: varchar({ length: 64 }),
    md5: varchar({ length: 32 }),
    uploadedBy: text("uploaded_by").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("attachments_case_id_idx").using(
      "btree",
      table.caseId.asc().nullsLast().op("uuid_ops"),
    ),
    index("attachments_evidence_id_idx").using(
      "btree",
      table.evidenceId.asc().nullsLast().op("uuid_ops"),
    ),
    index("attachments_uploaded_by_idx").using(
      "btree",
      table.uploadedBy.asc().nullsLast().op("text_ops"),
    ),
    unique("attachments_pathname_unique").on(table.pathname),
  ],
);

export const custodyEvents = pgTable(
  "custody_events",
  {
    id: uuid("event_id").defaultRandom().primaryKey().notNull(),
    evidenceId: uuid("evidence_id").notNull(),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    fromCustodian: uuid("from_custodian"),
    toCustodian: uuid("to_custodian"),
    fromLocation: varchar("from_location", { length: 255 }),
    toLocation: varchar("to_location", { length: 255 }),
    reason: text(),
    notes: text(),
    eventTimestamp: timestamp("event_timestamp", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    recordedBy: uuid("recorded_by").notNull(),
    transferorSignature: text("transferor_signature"),
    recipientSignature: text("recipient_signature"),
    signatureVerified: boolean("signature_verified").default(false),
    rowHash: varchar("row_hash", { length: 64 }),
  },
  (table) => [
    foreignKey({
      columns: [table.evidenceId],
      foreignColumns: [evidence.id],
      name: "custody_events_evidence_id_evidence_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.fromCustodian],
      foreignColumns: [personnel.id],
      name: "custody_events_from_custodian_personnel_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.toCustodian],
      foreignColumns: [personnel.id],
      name: "custody_events_to_custodian_personnel_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.recordedBy],
      foreignColumns: [personnel.id],
      name: "custody_events_recorded_by_personnel_id_fk",
    }).onDelete("restrict"),
  ],
);
