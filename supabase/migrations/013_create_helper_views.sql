-- ============================================================================
-- MIGRATION: Create Helper Views
-- ============================================================================
-- Database views that provide convenient aggregated data for the UI.
-- Views are like saved queries - they don't store data but make
-- complex queries simpler to use in application code.
-- ============================================================================

-- ============================================================================
-- CHANNEL STATS VIEW
-- ============================================================================
-- Provides member and post counts for each channel
-- Used when displaying channel cards in the UI
CREATE OR REPLACE VIEW public.channel_stats AS
SELECT
  c.id AS channel_id,
  c.slug,
  c.name,
  COUNT(DISTINCT cm.user_id) AS member_count,
  COUNT(DISTINCT p.id) AS post_count
FROM public.channels c
LEFT JOIN public.channel_memberships cm ON cm.channel_id = c.id
LEFT JOIN public.posts p ON p.channel_id = c.id AND p.is_draft = FALSE
GROUP BY c.id, c.slug, c.name;

-- ============================================================================
-- COMMUNITY STATS VIEW
-- ============================================================================
-- Provides overall community statistics
-- Used in the sidebar stats widget
CREATE OR REPLACE VIEW public.community_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS total_members,
  (SELECT COUNT(*) FROM public.posts WHERE is_draft = FALSE) AS total_posts,
  (SELECT COUNT(*) FROM public.channels) AS total_channels;

-- ============================================================================
-- HASHTAG COUNT UPDATE FUNCTION
-- ============================================================================
-- Helper function to recalculate a hashtag's post count
-- Called when posts are tagged/untagged
CREATE OR REPLACE FUNCTION public.update_hashtag_count(hashtag_name TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.hashtags
  SET post_count = (
    SELECT COUNT(*)
    FROM public.post_hashtags ph
    JOIN public.hashtags h ON h.id = ph.hashtag_id
    WHERE h.name = hashtag_name
  )
  WHERE name = hashtag_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
