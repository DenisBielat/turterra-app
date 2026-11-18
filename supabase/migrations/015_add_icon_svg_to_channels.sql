-- ============================================================================
-- MIGRATION: Add icon_svg column to channels, drop old icon column
-- ============================================================================
-- Stores the raw SVG markup for each channel icon directly in the database.
-- This replaces the old `icon` TEXT column (which stored Lucide icon names).
-- Paste the full <svg>...</svg> string into this column in Supabase.
-- ============================================================================

ALTER TABLE public.channels
  ADD COLUMN icon_svg TEXT;

-- Once you've populated icon_svg for all channels, you can drop the old column:
-- ALTER TABLE public.channels DROP COLUMN icon;
