-- ============================================================================
-- MIGRATION: Admin helper + lock privileged profile columns
-- ============================================================================
-- 1. public.is_admin() returns true when the signed-in user has
--    profiles.role = 'admin'. Used by row-level security policies and by the
--    /admin pages.
--
-- 2. Stops users from writing their own `role` / `is_verified`.
--    Until now the "Users can update their own profile" policy let any
--    signed-in user update every column of their own row, `role` included,
--    so anyone could make themselves an admin through the API. The same was
--    true when a new user inserted their profile during onboarding.
--    Row-level policies cannot restrict individual columns, so this uses
--    column-level privileges instead: signed-in users may only write the
--    profile fields the app edits. `role` and `is_verified` can then only be
--    changed from the SQL editor or with the service role key.
--
-- Safe to run more than once.
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'True when the signed-in user has profiles.role = ''admin''.';

-- Table-wide write access goes away; the row-level policies stay as they are.
revoke insert, update on public.profiles from anon, authenticated;

-- Onboarding inserts: id, username, display_name, bio, location.
grant insert (id, username, display_name, bio, location, avatar_url)
  on public.profiles to authenticated;

-- Settings / profile page updates: display_name, bio, location, avatar_url.
grant update (username, display_name, bio, location, avatar_url)
  on public.profiles to authenticated;
