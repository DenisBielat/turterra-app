-- ============================================================================
-- MIGRATION: Create Hot Score Algorithm
-- ============================================================================
-- This implements a Reddit-style "hot" ranking algorithm that balances
-- a post's score with its age. Newer posts with modest engagement can
-- outrank older posts with higher scores, keeping content fresh.
--
-- The algorithm:
-- 1. Takes the log of the absolute score (diminishing returns for high scores)
-- 2. Adds time in 45000-second intervals since epoch (about 12.5 hours)
-- 3. Applies sign based on net votes (positive/negative/zero)
-- ============================================================================

-- Function to calculate the hot score
-- Based on Reddit's original algorithm, adapted for our use case
CREATE OR REPLACE FUNCTION public.calculate_hot_score(p_score INT, p_created_at TIMESTAMPTZ)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  order_val DOUBLE PRECISION;
  sign_val INT;
  seconds DOUBLE PRECISION;
BEGIN
  -- Determine the sign and order based on score
  IF p_score > 0 THEN
    sign_val := 1;
    order_val := LOG(GREATEST(ABS(p_score), 1));
  ELSIF p_score < 0 THEN
    sign_val := -1;
    order_val := LOG(GREATEST(ABS(p_score), 1));
  ELSE
    sign_val := 0;
    order_val := 0;
  END IF;

  -- Calculate seconds since January 1, 2024 (our epoch)
  -- 1704067200 = Unix timestamp for 2024-01-01 00:00:00 UTC
  seconds := EXTRACT(EPOCH FROM p_created_at) - 1704067200;

  -- Combine score and time factors
  -- 45000 seconds (~12.5 hours) determines how fast new content rises
  RETURN ROUND((sign_val * order_val + seconds / 45000)::NUMERIC, 7);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to automatically update hot_score when score changes
CREATE OR REPLACE FUNCTION public.update_post_hot_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hot_score := public.calculate_hot_score(NEW.score, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to posts table
-- Runs BEFORE insert/update so we can modify NEW.hot_score
CREATE TRIGGER on_post_score_change
  BEFORE INSERT OR UPDATE OF score ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_post_hot_score();
