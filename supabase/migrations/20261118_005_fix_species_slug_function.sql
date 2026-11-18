-- ============================================================================
-- MIGRATION: Fix the species slug generator
-- ============================================================================
-- generate_species_slug() builds turtle_species.slug from the common name when
-- a species is inserted or its common name changes. It called regexp_replace
-- without the 'g' flag, so only the FIRST space became a hyphen:
--
--   'American Box Turtle'  ->  'american-box turtle'   (should be american-box-turtle)
--
-- This version replaces every run of spaces and strips every punctuation mark.
-- Existing slugs are not touched: the function only runs on insert or when a
-- common name is edited.
--
-- Safe to run more than once.
-- ============================================================================

create or replace function public.generate_species_slug()
returns trigger
language plpgsql
as $function$
begin
  new.slug := lower(
    regexp_replace(
      regexp_replace(btrim(new.species_common_name), '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
  return new;
end;
$function$;
