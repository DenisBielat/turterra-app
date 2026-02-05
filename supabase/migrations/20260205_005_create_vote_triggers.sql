-- ============================================================================
-- MIGRATION: Create Vote Score Triggers
-- ============================================================================
-- These triggers automatically update the score on posts and comments
-- whenever a vote is added, changed, or removed. This keeps scores in sync
-- without requiring manual updates in application code.
-- ============================================================================

-- Trigger function to update post scores when votes change
CREATE OR REPLACE FUNCTION public.update_post_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE: recalculate score for the new post
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.posts
      SET score = COALESCE((SELECT SUM(value) FROM public.votes WHERE post_id = NEW.post_id), 0)
      WHERE id = NEW.post_id;
    END IF;
  END IF;

  -- Handle DELETE and UPDATE: recalculate score for the old post (if changed)
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.posts
      SET score = COALESCE((SELECT SUM(value) FROM public.votes WHERE post_id = OLD.post_id), 0)
      WHERE id = OLD.post_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update comment scores when votes change
CREATE OR REPLACE FUNCTION public.update_comment_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE: recalculate score for the new comment
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE public.comments
      SET score = COALESCE((SELECT SUM(value) FROM public.votes WHERE comment_id = NEW.comment_id), 0)
      WHERE id = NEW.comment_id;
    END IF;
  END IF;

  -- Handle DELETE and UPDATE: recalculate score for the old comment (if changed)
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE public.comments
      SET score = COALESCE((SELECT SUM(value) FROM public.votes WHERE comment_id = OLD.comment_id), 0)
      WHERE id = OLD.comment_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to the votes table
CREATE TRIGGER on_vote_change_post
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_score();

CREATE TRIGGER on_vote_change_comment
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_score();
