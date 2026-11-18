-- ============================================================================
-- MIGRATION: Create Comment Count Trigger
-- ============================================================================
-- This trigger keeps the comment_count field on posts synchronized with
-- the actual number of non-deleted comments. This denormalized count
-- avoids expensive COUNT queries when displaying post lists.
-- ============================================================================

-- Function to update the comment count on a post
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
DECLARE
  target_post_id BIGINT;
BEGIN
  -- Get the post_id from either the new or old record
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);

  -- Update the comment count (excluding soft-deleted comments)
  UPDATE public.posts
  SET comment_count = (
    SELECT COUNT(*)
    FROM public.comments
    WHERE post_id = target_post_id AND is_deleted = FALSE
  )
  WHERE id = target_post_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to comments table
CREATE TRIGGER on_comment_change
  AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();
