-- ============================================================================
-- MIGRATION: Create Profiles Table
-- ============================================================================
-- This table stores public profile information for authenticated users.
-- It's linked to Supabase's built-in auth.users table via the 'id' column.
--
-- HOW IT WORKS:
-- When a user signs up via Supabase Auth, they get an entry in auth.users
-- (managed by Supabase). We create a corresponding entry in THIS profiles
-- table to store additional info like username, bio, etc.
-- ============================================================================

-- Create the profiles table
-- The 'id' column references auth.users(id), meaning:
--   - Every profile MUST belong to an authenticated user
--   - ON DELETE CASCADE: if the user is deleted from auth.users, their profile is auto-deleted
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Username: unique identifier for the user (used in URLs like /@username)
  -- UNIQUE ensures no two users can have the same username
  -- NOT NULL means every user must have a username
  username TEXT UNIQUE NOT NULL,

  -- Display name: how the user's name appears on their profile (optional)
  -- Can be their real name, nickname, etc.
  display_name TEXT,

  -- Bio: short description about the user (optional)
  bio TEXT,

  -- Location: where the user is from (optional)
  location TEXT,

  -- Avatar URL: link to their profile picture (optional)
  -- Will typically point to Supabase Storage or Cloudinary
  avatar_url TEXT,

  -- Verified flag: for special accounts (staff, notable conservationists, etc.)
  -- Defaults to FALSE, only admins should be able to set this to TRUE
  is_verified BOOLEAN DEFAULT FALSE,

  -- Timestamps: automatically track when profile was created and last updated
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- CONSTRAINT: Enforce username format at database level
  -- This is a safety net - even if client-side validation is bypassed,
  -- the database will reject invalid usernames
  -- Rules: 3-30 chars, starts with letter, only lowercase letters/numbers/underscores
  CONSTRAINT valid_username_format CHECK (username ~ '^[a-z][a-z0-9_]{2,29}$')
);

-- Create an index on username for faster lookups
-- When someone visits /@turtlelover, we need to quickly find that profile
-- Without an index, the database would scan every row (slow)
-- With an index, it's like looking up a word in a dictionary's index (fast)
CREATE INDEX idx_profiles_username ON public.profiles(username);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS is Supabase's way of controlling who can read/write data.
-- Without RLS, anyone with the anon key could read/modify all data!
-- With RLS enabled, we define explicit rules (policies) for access.
-- ============================================================================

-- Enable RLS on the profiles table
-- IMPORTANT: Once enabled, NO queries work until we add policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Anyone can VIEW profiles (they're public)
-- This allows: SELECT * FROM profiles (for any user, even logged out)
-- "USING (true)" means "this policy always applies"
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- POLICY 2: Users can INSERT their own profile (during sign-up)
-- auth.uid() returns the currently logged-in user's ID
-- WITH CHECK ensures they can only insert a row where id = their own user id
-- This prevents User A from creating a profile for User B
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- POLICY 3: Users can UPDATE their own profile
-- USING: which existing rows can they try to update? (only their own)
-- WITH CHECK: what values can the updated row have? (must still be their own)
-- This prevents users from changing their profile to have someone else's ID
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- NOTE: No DELETE policy
-- Users cannot delete their own profile directly.
-- If they want to delete their account, it should go through a proper
-- account deletion flow. The profile will be auto-deleted via CASCADE
-- when the auth.users entry is deleted by an admin or through Supabase.
