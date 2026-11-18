-- ============================================================================
-- CONTENT: American Box Turtle (species) and Eastern Box Turtle (subspecies)
-- ============================================================================
-- The Eastern Box Turtle profile was stored as a species named
-- "Terrapene carolina ssp. carolina". It is a subspecies of Terrapene carolina
-- (Turtles of the World, 10th Ed., TTWG 2025: American Box Turtle, with the
-- subspecies carolina, bauri and major).
--
-- This file:
--   1. adds a profile row for the species, Terrapene carolina, as a DRAFT
--      (not visible on the site until it is written up and published);
--   2. turns the Eastern Box Turtle profile into a subspecies of it and gives
--      it the plain trinomial "Terrapene carolina carolina". Its slug, care
--      guide, avatar and published status are unchanged;
--   3. links the new species row to its checklist entry.
--
-- Requires migration 20261118_004. Safe to re-run.
-- ============================================================================

begin;

-- 1. The species
insert into public.turtle_species
  (species_common_name, species_scientific_name, tax_parent_genus, status, taxon_rank)
select 'American Box Turtle', 'Terrapene carolina', eastern.tax_parent_genus, 'draft', 'species'
from public.turtle_species eastern
where eastern.slug = 'eastern-box-turtle'
  and not exists (
    select 1 from public.turtle_species where species_scientific_name = 'Terrapene carolina'
  );

--    The database fills in the slug from the common name on insert. Set it
--    explicitly as well, so it is right whatever that generator produced.
update public.turtle_species
set slug = 'american-box-turtle'
where species_scientific_name = 'Terrapene carolina'
  and slug is distinct from 'american-box-turtle';

-- 2. Eastern Box Turtle becomes its subspecies
update public.turtle_species eastern
set species_scientific_name = 'Terrapene carolina carolina',
    taxon_rank = 'subspecies',
    parent_species_id = parent.id
from public.turtle_species parent
where eastern.slug = 'eastern-box-turtle'
  and parent.species_scientific_name = 'Terrapene carolina';

-- 3. Checklist link for the new species row
update public.species_checklist c
set turtle_species_id = s.id
from public.turtle_species s
where c.scientific_name = 'Terrapene carolina'
  and s.species_scientific_name = 'Terrapene carolina'
  and c.turtle_species_id is null;

commit;
