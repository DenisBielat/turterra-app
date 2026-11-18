-- ============================================================================
-- MIGRATION: Create Reserved Usernames Table
-- ============================================================================
-- This table stores usernames that users CANNOT register.
-- We reserve them for:
--   1. System routes (login, signup, settings, api, etc.)
--   2. Brand protection (turterra, turtle, etc.)
--   3. Future features (forums, blog, etc.)
--
-- WHY A SEPARATE TABLE?
-- - Easy to add/remove reserved names without changing code
-- - Can add a reason column to document WHY each is reserved
-- - The is_username_available() function checks this table automatically
-- ============================================================================

-- Create the reserved usernames table
CREATE TABLE public.reserved_usernames (
  username TEXT PRIMARY KEY,  -- The reserved username
  reason TEXT                 -- Why it's reserved (for documentation)
);

-- Insert reserved usernames
-- Organized by category for easier maintenance
INSERT INTO public.reserved_usernames (username, reason) VALUES
  -- System/Auth routes
  ('admin', 'system'),
  ('administrator', 'system'),
  ('support', 'system'),
  ('help', 'system'),
  ('api', 'system'),
  ('auth', 'system'),
  ('oauth', 'system'),
  ('login', 'system'),
  ('logout', 'system'),
  ('signup', 'system'),
  ('signin', 'system'),
  ('register', 'system'),
  ('join', 'system'),           -- Your signup CTA uses /join
  ('account', 'system'),
  ('accounts', 'system'),
  ('settings', 'system'),
  ('profile', 'system'),
  ('profiles', 'system'),
  ('user', 'system'),
  ('users', 'system'),
  ('me', 'system'),

  -- Web infrastructure
  ('www', 'system'),
  ('mail', 'system'),
  ('email', 'system'),
  ('ftp', 'system'),
  ('cdn', 'system'),
  ('assets', 'system'),
  ('static', 'system'),

  -- Turterra brand protection
  ('turterra', 'brand'),
  ('turtle', 'brand'),
  ('turtles', 'brand'),
  ('conservation', 'brand'),
  ('terrapin', 'brand'),
  ('tortoise', 'brand'),

  -- Existing routes in your app (from codebase analysis)
  ('turtle_guide', 'route'),    -- /turtle-guide (underscored version)
  ('turtleguide', 'route'),     -- /turtle-guide (no separator)
  ('species_identifier', 'route'),
  ('speciesidentifier', 'route'),
  ('search', 'route'),

  -- Future/planned features
  ('forums', 'feature'),
  ('forum', 'feature'),
  ('community', 'feature'),
  ('guides', 'feature'),
  ('guide', 'feature'),
  ('blog', 'feature'),
  ('vets', 'feature'),
  ('vet', 'feature'),
  ('donate', 'feature'),
  ('donation', 'feature'),
  ('donations', 'feature'),
  ('shop', 'feature'),
  ('store', 'feature'),
  ('marketplace', 'feature'),

  -- Organization-related (for future org feature)
  ('org', 'system'),
  ('orgs', 'system'),
  ('organization', 'system'),
  ('organizations', 'system'),
  ('team', 'system'),
  ('teams', 'system'),

  -- Moderation/abuse prevention
  ('moderator', 'system'),
  ('mod', 'system'),
  ('staff', 'system'),
  ('official', 'system'),
  ('verified', 'system'),
  ('root', 'system'),
  ('sysadmin', 'system'),
  ('webmaster', 'system'),
  ('postmaster', 'system'),
  ('hostmaster', 'system'),
  ('abuse', 'system'),
  ('security', 'system'),
  ('spam', 'system'),
  ('info', 'system'),
  ('contact', 'system'),
  ('feedback', 'system'),
  ('null', 'system'),
  ('undefined', 'system'),
  ('anonymous', 'system'),
  ('unknown', 'system'),
  ('nobody', 'system'),
  ('everyone', 'system'),
  ('all', 'system');

-- ============================================================================
-- NOTE: RLS is NOT enabled on this table
-- ============================================================================
-- This table is read-only reference data. The is_username_available() function
-- (which has SECURITY DEFINER) handles access. Regular users don't need to
-- query this table directly.
--
-- If you want to be extra cautious, you could enable RLS and add a SELECT
-- policy for everyone, but it's not strictly necessary for this use case.
-- ============================================================================

-- Optional: Enable RLS with read-only access
-- Uncomment if you want the extra security layer:
--
-- ALTER TABLE public.reserved_usernames ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Reserved usernames are viewable by everyone"
--   ON public.reserved_usernames
--   FOR SELECT
--   USING (true);
