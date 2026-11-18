-- ============================================================================
-- MIGRATION: Create Username Validation Functions
-- ============================================================================
-- These functions help validate and check username availability.
-- They're called from your Next.js app when users pick a username.
--
-- WHY DATABASE FUNCTIONS INSTEAD OF JUST APP CODE?
-- 1. Security: Even if someone bypasses your app, the database enforces rules
-- 2. Consistency: One source of truth for validation logic
-- 3. Performance: Checking availability is faster when done in the database
-- 4. SECURITY DEFINER: Lets the function access tables the user can't directly
-- ============================================================================

-- FUNCTION 1: Validate username format
-- Returns TRUE if the username follows our rules, FALSE otherwise
-- Rules: 3-30 characters, starts with letter, only lowercase letters/numbers/underscores
CREATE OR REPLACE FUNCTION public.is_valid_username(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- The ~ operator tests if the text matches a regular expression (regex)
  -- ^[a-z]       = must start with a lowercase letter
  -- [a-z0-9_]    = followed by lowercase letters, numbers, or underscores
  -- {2,29}       = the previous pattern must appear 2-29 more times
  -- $            = end of string
  -- Total length: 1 (first char) + 2-29 (rest) = 3-30 characters
  RETURN username ~ '^[a-z][a-z0-9_]{2,29}$';
END;
$$ LANGUAGE plpgsql;

-- FUNCTION 2: Check if username is available
-- Returns TRUE if the username can be used, FALSE if it's taken or reserved
-- SECURITY DEFINER means this function runs with the privileges of its creator,
-- not the user calling it. This lets us check tables the user can't see directly.
CREATE OR REPLACE FUNCTION public.is_username_available(desired_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if username is in the reserved list (system words, brand terms, etc.)
  IF EXISTS (SELECT 1 FROM public.reserved_usernames WHERE username = desired_username) THEN
    RETURN FALSE;
  END IF;

  -- Check if username is already taken by another user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = desired_username) THEN
    RETURN FALSE;
  END IF;

  -- Future enhancement: Also check organizations table when you add that feature
  -- IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = desired_username) THEN
  --   RETURN FALSE;
  -- END IF;

  -- Username is available!
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HOW YOUR APP WILL USE THESE:
-- ============================================================================
-- In your Next.js code, when a user types a username, you'll call:
--
--   const { data } = await supabase
--     .rpc('is_username_available', { desired_username: 'turtlelover' })
--
-- The function returns true/false, and you show "Available" or "Taken"
-- ============================================================================
