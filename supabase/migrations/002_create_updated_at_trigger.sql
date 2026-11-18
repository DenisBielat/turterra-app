-- ============================================================================
-- MIGRATION: Create updated_at Trigger
-- ============================================================================
-- This creates a reusable function that automatically updates the 'updated_at'
-- column whenever a row is modified. We then attach it to the profiles table.
--
-- WHY DO WE NEED THIS?
-- Without a trigger, you'd have to manually set updated_at = NOW() in every
-- UPDATE query. That's easy to forget and leads to stale timestamps.
-- With a trigger, the database handles it automatically - you can't forget!
-- ============================================================================

-- Create the trigger function
-- This function will be called automatically before any UPDATE operation
-- "CREATE OR REPLACE" means: create it, or update it if it already exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- NEW refers to the row being updated (with the new values)
  -- We set its updated_at to the current timestamp
  NEW.updated_at = NOW();
  -- RETURN NEW tells PostgreSQL to proceed with the updated row
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the profiles table
-- BEFORE UPDATE: run this function BEFORE the update is saved
-- FOR EACH ROW: run once per row being updated (not once per statement)
-- EXECUTE FUNCTION: call our handle_updated_at function
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- HOW TRIGGERS WORK (simplified):
-- ============================================================================
-- 1. User runs: UPDATE profiles SET bio = 'I love turtles' WHERE id = '123'
-- 2. PostgreSQL sees there's a BEFORE UPDATE trigger on profiles
-- 3. For each row being updated, it calls handle_updated_at()
-- 4. handle_updated_at() sets NEW.updated_at = NOW()
-- 5. PostgreSQL saves the row with both the new bio AND the new updated_at
-- ============================================================================
