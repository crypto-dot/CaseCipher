GRANT USAGE ON SCHEMA public TO app_writer;

-- full access to normal app tables
GRANT SELECT, INSERT, UPDATE, DELETE ON cases, attachments, case_notes, evidence, personnel, custody_events, user_profiles TO app_writer;

-- audit table: append-only
GRANT SELECT, INSERT ON audit_log TO app_writer;
REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM app_writer, PUBLIC;

-- custody events table: append-only
GRANT SELECT, INSERT ON custody_events TO app_writer;
REVOKE UPDATE, DELETE, TRUNCATE ON custody_events FROM app_writer, PUBLIC;

-- so future tables you add are usable without another grant migration
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_writer;