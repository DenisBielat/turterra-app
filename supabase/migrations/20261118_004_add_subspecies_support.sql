-- ============================================================================
-- MIGRATION: Subspecies support for species profiles
-- ============================================================================
-- A subspecies gets its own profile row in turtle_species, exactly like a
-- species, with its own text, measurements, photos and so on. Two columns
-- record how it fits in:
--
--   taxon_rank          'species' (default) or 'subspecies'
--   parent_species_id   for a subspecies, the turtle_species row of the
--                       species it belongs to; empty for a species
--
-- Nothing is inherited between the two: each page shows only its own content.
-- The link is used to show "Subspecies of ..." on a subspecies page and to
-- list subspecies on the species page.
--
-- Existing rows are untouched (all become rank 'species').
-- Safe to run more than once.
-- ============================================================================

alter table public.turtle_species
  add column if not exists taxon_rank text not null default 'species',
  add column if not exists parent_species_id bigint;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'turtle_species_taxon_rank_check') then
    alter table public.turtle_species
      add constraint turtle_species_taxon_rank_check
      check (taxon_rank in ('species', 'subspecies'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'turtle_species_parent_species_id_fkey') then
    alter table public.turtle_species
      add constraint turtle_species_parent_species_id_fkey
      foreign key (parent_species_id) references public.turtle_species (id) on delete restrict;
  end if;

  -- A subspecies always names its species; a species never has a parent;
  -- and a row cannot be its own parent.
  if not exists (select 1 from pg_constraint where conname = 'turtle_species_parent_matches_rank') then
    alter table public.turtle_species
      add constraint turtle_species_parent_matches_rank
      check (
        (taxon_rank = 'subspecies') = (parent_species_id is not null)
        and parent_species_id is distinct from id
      );
  end if;
end
$$;

create index if not exists idx_turtle_species_parent
  on public.turtle_species (parent_species_id);

comment on column public.turtle_species.taxon_rank is
  'species or subspecies. Subspecies have their own profile and must set parent_species_id.';
comment on column public.turtle_species.parent_species_id is
  'For a subspecies: the turtle_species row of its species.';
