-- ============================================================================
-- MIGRATION: Draft / published status for species profiles
-- ============================================================================
-- Adds turtle_species.status so a species can be entered and reviewed before
-- it appears on the site (same idea as care_guides.care_guides.status).
--
--   * Every species that exists today is marked 'published', so nothing
--     changes on the live site when this runs.
--   * New rows default to 'draft'.
--   * The public read policy only returns published species; admins
--     (profiles.role = 'admin') also see drafts, which is what lets you
--     preview a draft profile while signed in.
--
-- Requires 017 (public.is_admin). Safe to run more than once.
-- ============================================================================

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'turtle_species'
      and column_name = 'status'
  ) then
    -- Adding the column with this default marks all existing rows published...
    alter table public.turtle_species
      add column status text not null default 'published'
      constraint turtle_species_status_check check (status in ('draft', 'published'));

    -- ...and from here on, new species start as drafts.
    alter table public.turtle_species
      alter column status set default 'draft';
  end if;
end
$$;

comment on column public.turtle_species.status is
  'draft = only visible to admins; published = visible on the site.';

drop policy if exists "Enable read access for all users" on public.turtle_species;
drop policy if exists "Published species are viewable by everyone" on public.turtle_species;

create policy "Published species are viewable by everyone"
  on public.turtle_species
  for select
  using (status = 'published' or (select public.is_admin()));
