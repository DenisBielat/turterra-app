-- ============================================================================
-- SEED DATA: Community News
-- ============================================================================
-- Run this in the Supabase SQL editor to populate the news carousel.
-- This is NOT a migration — it's optional seed data for testing.
-- ============================================================================

INSERT INTO public.community_news (title, excerpt, slug, news_type, partner_name, image_url, is_published, published_at) VALUES
  ('Sea Turtle Nesting Season Report', 'Connect with fellow turtle enthusiasts, share your experiences, and learn from the community. Join discussions, ask questions, and help others on their turtle journey.', 'sea-turtle-nesting-report', 'conservation', 'Re:Wild', NULL, true, NOW() - INTERVAL '24 days'),
  ('Turterra Updates | Jan 2026', 'Connect with fellow turtle enthusiasts, share your experiences, and learn from the community. Join discussions, ask questions, and help others on their turtle journey.', 'turterra-updates-jan-2026', 'announcement', 'Turterra', NULL, true, NOW() - INTERVAL '29 days'),
  ('Turtle Survival Alliance Updates', 'Connect with fellow turtle enthusiasts, share your experiences, and learn from the community. Join discussions, ask questions, and help others on their turtle journey.', 'tsa-breeding-program', 'partner_news', 'Turtle Survival Alliance', NULL, true, NOW() - INTERVAL '32 days'),
  ('Community Spotlight: Rescue Success Story', 'Member @turtlelover_sarah shares her incredible journey rehabilitating an injured box turtle back to health.', 'rescue-success-story', 'featured', NULL, NULL, true, NOW() - INTERVAL '34 days')
ON CONFLICT (slug) DO NOTHING;
