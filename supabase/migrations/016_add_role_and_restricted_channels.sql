-- ============================================================================
-- MIGRATION: Add role column to profiles + restricted column to channels
-- ============================================================================
-- Adds user role support (user, moderator, admin) and channel-level
-- posting restrictions so only admins/mods can post in certain channels.
-- ============================================================================

-- Add role column to profiles (defaults to 'user')
ALTER TABLE public.profiles
  ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  CONSTRAINT valid_role CHECK (role IN ('user', 'moderator', 'admin'));

-- Add restricted column to channels (defaults to false)
ALTER TABLE public.channels
  ADD COLUMN restricted BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark announcements and roadmaps channels as restricted
UPDATE public.channels SET restricted = TRUE WHERE slug IN ('announcements', 'roadmaps');
