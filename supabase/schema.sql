-- ============================================================
-- Luxe Invite: Supabase Schema
-- Run this in Supabase → SQL Editor
-- ============================================================

-- Drop if re-running
DROP TABLE IF EXISTS public.invitations;

-- Create invitations table
CREATE TABLE public.invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code     TEXT UNIQUE NOT NULL,
  guest_name      TEXT NOT NULL,
  table_number    TEXT NOT NULL,
  checked_in      BOOLEAN NOT NULL DEFAULT false,
  checked_in_at   TIMESTAMPTZ NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by invite_code (used on every page load)
CREATE INDEX idx_invitations_invite_code ON public.invitations(invite_code);

-- Enable Row Level Security
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies ─────────────────────────────────────────
-- Guests can read their own invitation by invite_code (SELECT)
CREATE POLICY "Read by invite_code"
  ON public.invitations
  FOR SELECT
  USING (true);  -- Public read; the invite_code itself is the "password"

-- Only the server (via anon key on update) can mark as checked in
-- For production, use a service role key in a server action/API route
CREATE POLICY "Allow check-in update"
  ON public.invitations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ─── Seed Data ────────────────────────────────────────────
-- Sample guests for testing
INSERT INTO public.invitations (invite_code, guest_name, table_number) VALUES
  ('demo-guest-001', 'Chief Emmanuel Adeyemi',   'Table 1 — Head'),
  ('demo-guest-002', 'Dr. Ngozi Okonkwo',         'Table 2 — Family'),
  ('demo-guest-003', 'Pastor & Mrs. Abiodun',     'Table 3 — Church'),
  ('demo-guest-004', 'Barrister Tunde Fashola',   'Table 4 — Friends'),
  ('demo-guest-005', 'Prof. Amaka Eze',            'Table 5 — Colleagues'),
  ('demo-guest-006', 'Ambassador Chidi Okeke',    'Table 2 — Family'),
  ('demo-guest-007', 'Mrs. Folake Balogun',        'Table 6 — Neighbours'),
  ('demo-guest-008', 'Mr. Rotimi & Mrs. Yetunde', 'Table 4 — Friends');

-- ─── Verify ───────────────────────────────────────────────
SELECT
  id,
  invite_code,
  guest_name,
  table_number,
  checked_in,
  created_at
FROM public.invitations
ORDER BY created_at;
