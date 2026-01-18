-- ============================================================================
-- Row Level Security Policies for CaseCipher
-- ============================================================================
-- 
-- These policies enforce access control at the database level.
-- Run this SQL after enabling RLS and creating your tables.
--
-- Prerequisites:
-- 1. Enable RLS on tables: ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
-- 2. Ensure neon_auth schema is accessible
-- ============================================================================

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id TEXT)
RETURNS TEXT AS $$
  SELECT role::TEXT FROM user_profiles WHERE user_profiles.user_id = $1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- User Profiles Policies
-- ============================================================================

-- Users can read their own profile
CREATE POLICY user_profiles_select_own ON user_profiles
  FOR SELECT
  USING (user_id = auth.user_id());

-- Admins can read all profiles
CREATE POLICY user_profiles_select_admin ON user_profiles
  FOR SELECT
  USING (get_user_role(auth.user_id()) = 'admin');

-- Admins can manage all profiles
CREATE POLICY user_profiles_all_admin ON user_profiles
  FOR ALL
  USING (get_user_role(auth.user_id()) = 'admin');

-- ============================================================================
-- Clients Policies
-- ============================================================================

-- All authenticated users can read clients
CREATE POLICY clients_select_all ON clients
  FOR SELECT
  USING (auth.user_id() IS NOT NULL);

-- Admins and managers can create/update clients
CREATE POLICY clients_insert_admin_manager ON clients
  FOR INSERT
  WITH CHECK (get_user_role(auth.user_id()) IN ('admin', 'manager'));

CREATE POLICY clients_update_admin_manager ON clients
  FOR UPDATE
  USING (get_user_role(auth.user_id()) IN ('admin', 'manager'));

-- Only admins can delete clients
CREATE POLICY clients_delete_admin ON clients
  FOR DELETE
  USING (get_user_role(auth.user_id()) = 'admin');

-- ============================================================================
-- Cases Policies
-- ============================================================================

-- Admins and managers can see all cases
CREATE POLICY cases_select_admin_manager ON cases
  FOR SELECT
  USING (get_user_role(auth.user_id()) IN ('admin', 'manager'));

-- Analysts and examiners can see assigned cases or cases they created
CREATE POLICY cases_select_assigned ON cases
  FOR SELECT
  USING (
    assigned_to = auth.user_id() 
    OR created_by = auth.user_id()
  );

-- Admins, managers, and analysts can create cases
CREATE POLICY cases_insert ON cases
  FOR INSERT
  WITH CHECK (get_user_role(auth.user_id()) IN ('admin', 'manager', 'analyst'));

-- Users with write permission can update cases they have access to
CREATE POLICY cases_update_admin_manager ON cases
  FOR UPDATE
  USING (get_user_role(auth.user_id()) IN ('admin', 'manager'));

CREATE POLICY cases_update_assigned ON cases
  FOR UPDATE
  USING (
    get_user_role(auth.user_id()) = 'analyst'
    AND (assigned_to = auth.user_id() OR created_by = auth.user_id())
  );

-- Only admins can delete cases
CREATE POLICY cases_delete_admin ON cases
  FOR DELETE
  USING (get_user_role(auth.user_id()) = 'admin');

-- ============================================================================
-- Evidence Policies
-- ============================================================================

-- Users can view evidence for cases they can access
CREATE POLICY evidence_select ON evidence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = evidence.case_id
      AND (
        get_user_role(auth.user_id()) IN ('admin', 'manager')
        OR cases.assigned_to = auth.user_id()
        OR cases.created_by = auth.user_id()
      )
    )
  );

-- Users with evidence:write can upload to accessible cases
CREATE POLICY evidence_insert ON evidence
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = evidence.case_id
      AND (
        get_user_role(auth.user_id()) IN ('admin', 'manager', 'analyst')
        AND (
          get_user_role(auth.user_id()) IN ('admin', 'manager')
          OR cases.assigned_to = auth.user_id()
          OR cases.created_by = auth.user_id()
        )
      )
    )
  );

-- Only admins can delete evidence
CREATE POLICY evidence_delete_admin ON evidence
  FOR DELETE
  USING (get_user_role(auth.user_id()) = 'admin');

-- ============================================================================
-- Case Notes Policies
-- ============================================================================

-- Users can view notes for cases they can access
CREATE POLICY case_notes_select ON case_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_notes.case_id
      AND (
        get_user_role(auth.user_id()) IN ('admin', 'manager')
        OR cases.assigned_to = auth.user_id()
        OR cases.created_by = auth.user_id()
      )
    )
  );

-- Users can add notes to cases they have access to
CREATE POLICY case_notes_insert ON case_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_notes.case_id
      AND (
        get_user_role(auth.user_id()) IN ('admin', 'manager')
        OR cases.assigned_to = auth.user_id()
        OR cases.created_by = auth.user_id()
      )
    )
  );

-- Users can update their own notes
CREATE POLICY case_notes_update_own ON case_notes
  FOR UPDATE
  USING (author_id = auth.user_id());

-- Admins can update any note
CREATE POLICY case_notes_update_admin ON case_notes
  FOR UPDATE
  USING (get_user_role(auth.user_id()) = 'admin');

-- ============================================================================
-- Audit Log Policies
-- ============================================================================

-- Only admins and managers can read audit logs
CREATE POLICY audit_log_select ON audit_log
  FOR SELECT
  USING (get_user_role(auth.user_id()) IN ('admin', 'manager'));

-- Insert is handled by application (service role)
-- No direct insert policy for users
