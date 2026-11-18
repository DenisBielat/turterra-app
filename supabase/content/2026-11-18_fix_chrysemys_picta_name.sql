-- ============================================================================
-- CONTENT FIX: scientific name capitalisation
-- ============================================================================
-- The species epithet is always lower case: "Chrysemys picta", not
-- "Chrysemys Picta". Nothing else keys off this value (care guides, user
-- turtles and images all reference the species by id or slug).
-- Safe to re-run.
-- ============================================================================

update public.turtle_species
set species_scientific_name = 'Chrysemys picta'
where species_scientific_name = 'Chrysemys Picta';
