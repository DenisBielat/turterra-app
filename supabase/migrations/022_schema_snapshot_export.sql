-- ============================================================================
-- MIGRATION: Schema snapshot without a secret key
-- ============================================================================
-- docs/supabase-schema.md is the record of the database structure kept in the
-- repo. Supabase's new API keys no longer let a public key read the schema
-- description, so this adds a way to produce the snapshot from the database
-- itself and hand it over safely:
--
--   private.schema_snapshot()         the whole structure of the listed schemas
--                                     as one JSON document (tables, columns,
--                                     constraints, indexes, row-level security
--                                     policies, triggers, views, enums,
--                                     functions)
--
--   private.export_schema_snapshot()  stores a snapshot and returns a one-time
--                                     token for it
--
--   public.claim_export(token)        returns the stored document for a token,
--                                     once, and deletes it. Unknown, used or
--                                     expired tokens return nothing.
--
-- How it is used:
--   1. In the SQL editor (or through the Supabase connector):
--        select private.export_schema_snapshot();
--   2. In the repo:   npm run db:snapshot -- <token>
--
-- The "private" schema is not exposed through the API, so the snapshot
-- functions and the stored documents can only be reached from the SQL editor
-- or with database credentials. The only thing reachable through the API is
-- claim_export, which needs a random 122-bit token that works once and
-- expires after 15 minutes.
--
-- Safe to run more than once.
-- ============================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- The snapshot
-- ----------------------------------------------------------------------------
create or replace function private.schema_snapshot(
  p_schemas text[] default array['public', 'care_guides', 'private']
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'generated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'postgres_version', current_setting('server_version'),
    'schemas', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', n.nspname,

        'enums', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', t.typname,
            'values', (
              select jsonb_agg(e.enumlabel order by e.enumsortorder)
              from pg_catalog.pg_enum e
              where e.enumtypid = t.oid
            )
          ) order by t.typname)
          from pg_catalog.pg_type t
          where t.typnamespace = n.oid and t.typtype = 'e'
        ), '[]'::jsonb),

        'relations', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', c.relname,
            'kind', case c.relkind when 'v' then 'view' when 'm' then 'materialized view' else 'table' end,
            'comment', pg_catalog.obj_description(c.oid, 'pg_class'),
            'rls_enabled', c.relrowsecurity,
            'view_definition', case when c.relkind in ('v', 'm') then pg_catalog.pg_get_viewdef(c.oid, true) end,
            'columns', coalesce((
              select jsonb_agg(jsonb_build_object(
                'name', a.attname,
                'type', pg_catalog.format_type(a.atttypid, a.atttypmod),
                'nullable', not a.attnotnull,
                'default', pg_catalog.pg_get_expr(d.adbin, d.adrelid),
                'identity', case a.attidentity when 'a' then 'always' when 'd' then 'by default' end,
                'comment', pg_catalog.col_description(c.oid, a.attnum)
              ) order by a.attnum)
              from pg_catalog.pg_attribute a
              left join pg_catalog.pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
              where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
            ), '[]'::jsonb),
            'constraints', coalesce((
              select jsonb_agg(jsonb_build_object(
                'name', k.conname,
                'type', case k.contype when 'p' then 'primary key' when 'f' then 'foreign key'
                                       when 'u' then 'unique' when 'c' then 'check' else k.contype::text end,
                'definition', pg_catalog.pg_get_constraintdef(k.oid, true)
              ) order by k.contype, k.conname)
              from pg_catalog.pg_constraint k
              where k.conrelid = c.oid
            ), '[]'::jsonb),
            'indexes', coalesce((
              select jsonb_agg(jsonb_build_object(
                'name', ic.relname,
                'definition', pg_catalog.pg_get_indexdef(i.indexrelid)
              ) order by ic.relname)
              from pg_catalog.pg_index i
              join pg_catalog.pg_class ic on ic.oid = i.indexrelid
              where i.indrelid = c.oid
                -- indexes that back a constraint are already listed above
                and not exists (select 1 from pg_catalog.pg_constraint k where k.conindid = i.indexrelid)
            ), '[]'::jsonb),
            'policies', coalesce((
              select jsonb_agg(jsonb_build_object(
                'name', p.polname,
                'command', case p.polcmd when 'r' then 'select' when 'a' then 'insert'
                                         when 'w' then 'update' when 'd' then 'delete' else 'all' end,
                'roles', coalesce((
                  select jsonb_agg(r.rolname order by r.rolname)
                  from pg_catalog.pg_roles r
                  where r.oid = any (p.polroles)
                ), '["public"]'::jsonb),
                'using', pg_catalog.pg_get_expr(p.polqual, p.polrelid),
                'with_check', pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid)
              ) order by p.polname)
              from pg_catalog.pg_policy p
              where p.polrelid = c.oid
            ), '[]'::jsonb),
            'triggers', coalesce((
              select jsonb_agg(jsonb_build_object(
                'name', tg.tgname,
                'definition', pg_catalog.pg_get_triggerdef(tg.oid, true)
              ) order by tg.tgname)
              from pg_catalog.pg_trigger tg
              where tg.tgrelid = c.oid and not tg.tgisinternal
            ), '[]'::jsonb)
          ) order by c.relname)
          from pg_catalog.pg_class c
          where c.relnamespace = n.oid
            and c.relkind in ('r', 'p', 'v', 'm')
            -- leave out tables that belong to an extension
            and not exists (
              select 1 from pg_catalog.pg_depend dep
              where dep.objid = c.oid and dep.deptype = 'e'
            )
        ), '[]'::jsonb),

        'functions', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', f.proname,
            'arguments', pg_catalog.pg_get_function_identity_arguments(f.oid),
            'returns', pg_catalog.pg_get_function_result(f.oid),
            'security_definer', f.prosecdef,
            'definition', pg_catalog.pg_get_functiondef(f.oid)
          ) order by f.proname, pg_catalog.pg_get_function_identity_arguments(f.oid))
          from pg_catalog.pg_proc f
          where f.pronamespace = n.oid
            and f.prokind = 'f'
            -- leave out functions that belong to an extension
            and not exists (
              select 1 from pg_catalog.pg_depend dep
              where dep.objid = f.oid and dep.deptype = 'e'
            )
        ), '[]'::jsonb)
      ) order by n.nspname)
      from pg_catalog.pg_namespace n
      where n.nspname = any (p_schemas)
    ), '[]'::jsonb)
  );
$$;

comment on function private.schema_snapshot(text[]) is
  'Structure of the given schemas as one JSON document. Rendered into docs/supabase-schema.md by npm run db:snapshot.';

-- ----------------------------------------------------------------------------
-- One-time hand-over
-- ----------------------------------------------------------------------------
create table if not exists private.exports (
  token uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes'
);

comment on table private.exports is
  'Documents waiting to be collected once through public.claim_export(token). Rows expire after 15 minutes.';

alter table private.exports enable row level security;   -- no policies: unreachable except through claim_export

create or replace function private.export_schema_snapshot()
returns uuid
language sql
set search_path = ''
as $$
  insert into private.exports (payload)
  select private.schema_snapshot()
  returning token;
$$;

comment on function private.export_schema_snapshot() is
  'Stores a schema snapshot and returns the one-time token to collect it with: npm run db:snapshot -- <token>';

create or replace function public.claim_export(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  delete from private.exports where expires_at < now();

  delete from private.exports
  where token = p_token
  returning payload into result;

  return result;   -- null when the token is unknown, already used or expired
end;
$$;

comment on function public.claim_export(uuid) is
  'Returns a stored export for its one-time token and deletes it. Returns null for unknown, used or expired tokens.';

revoke execute on function public.claim_export(uuid) from public;
grant execute on function public.claim_export(uuid) to anon, authenticated, service_role;
