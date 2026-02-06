-- ============================================================================
-- MIGRATION: Add icon_url column to channels table
-- ============================================================================
-- Allows channels to use custom icon images instead of Lucide icon names.
-- Place custom icons in public/images/channel-icons/ and set the URL here.
-- Falls back to the Lucide icon name in the `icon` column when icon_url is NULL.
-- ============================================================================

ALTER TABLE public.channels
  ADD COLUMN icon_url TEXT;

-- Optionally set custom icon URLs (uncomment and update paths as needed):
-- UPDATE public.channels SET icon_url = '/images/channel-icons/announcements.svg' WHERE slug = 'announcements';
-- UPDATE public.channels SET icon_url = '/images/channel-icons/roadmap.svg' WHERE slug = 'roadmap';
