-- ============================================================================
-- MIGRATION: Parent species lookup for subspecies profiles
-- ============================================================================
-- A subspecies profile names the species it belongs to (the "Subspecies of ..."
-- line and the Species row in the taxonomy popup). When the species' own
-- profile is still a draft, visitors cannot read that row, so the page could
-- only show the scientific name.
--
-- get_parent_species(id) returns the parent's names for a subspecies profile
-- the caller is allowed to see, whether or not the parent profile is
-- published. It returns nothing else about a draft: no text, no other
-- columns. is_published tells the page whether it can link to the parent.
--
-- Requires 017 (is_admin), 018 (status) and 020 (parent_species_id).
-- Safe to run more than once.
-- ============================================================================

create or replace function public.get_parent_species(p_species_id bigint)
returns table (
  id bigint,
  species_common_name text,
  species_scientific_name text,
  slug text,
  avatar_image_circle_url text,
  is_published boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    parent.id,
    parent.species_common_name,
    parent.species_scientific_name,
    parent.slug,
    parent.avatar_image_circle_url,
    parent.status = 'published'
  from public.turtle_species child
  join public.turtle_species parent on parent.id = child.parent_species_id
  where child.id = p_species_id
    -- only for a subspecies profile the caller could open anyway
    and (child.status = 'published' or (select public.is_admin()));
$$;

comment on function public.get_parent_species(bigint) is
  'Names of the parent species of a subspecies profile, even while the parent profile is a draft.';

revoke execute on function public.get_parent_species(bigint) from public;
grant execute on function public.get_parent_species(bigint) to anon, authenticated, service_role;
