# Supabase Migrations

This folder contains SQL migrations for the Turterra database schema.

## How to Run Migrations

For now, run these manually in the **Supabase Dashboard**:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Turterra project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **+ New query**
5. Copy the contents of each migration file and run them **in order**

### Migration Order

Run these in sequence (each depends on the previous):

| # | File | Description |
|---|------|-------------|
| 1 | `20260202_001_create_profiles_table.sql` | Creates profiles table with RLS policies |
| 2 | `20260202_002_create_updated_at_trigger.sql` | Auto-updates `updated_at` timestamp |
| 3 | `20260202_003_create_username_functions.sql` | Username validation functions |
| 4 | `20260202_004_create_reserved_usernames.sql` | Reserved/blocked usernames list |

## Verifying Migrations Worked

After running all migrations, you can verify in the Supabase Dashboard:

1. **Table Editor** → You should see `profiles` and `reserved_usernames` tables
2. **Database** → **Functions** → You should see `handle_updated_at`, `is_valid_username`, and `is_username_available`
3. **Authentication** → **Policies** → Click on `profiles` to see the RLS policies

## Future: Automated Migrations

When your project grows, you can use the [Supabase CLI](https://supabase.com/docs/guides/cli) to:
- Run migrations automatically
- Generate TypeScript types from your schema
- Manage multiple environments (dev, staging, prod)

For now, manual SQL execution is fine for getting started.

## Species tracker (November 2026)

Run these in order. Each one is safe to run more than once.

| # | File | Description |
|---|------|-------------|
| 1 | `20261118_001_admin_helper_and_lock_profile_role.sql` | `is_admin()` helper; stops users changing their own `role` / `is_verified` |
| 2 | `20261118_002_add_species_status.sql` | `turtle_species.status` (`draft` / `published`); existing species stay published, new ones start as drafts |
| 3 | `20261118_003_create_species_checklist.sql` | `species_checklist` table and the `admin_species_progress` view behind `/admin/species` |

Then load the checklist: `supabase/content/species_checklist_seed.sql`.

## Content files (`supabase/content/`)

Schema changes live in `supabase/migrations/`. Data entry lives in
`supabase/content/`: one re-runnable SQL file per piece of content (a species,
a fix, the checklist seed), so it can be reviewed before it is run and the repo
keeps a copy of what was entered.

`species_checklist_seed.sql` is generated; rebuild it with
`npm run db:checklist-seed` rather than editing it.

## Schema reference

`docs/supabase-schema.md` lists every table and column. Regenerate it after a
schema change with `npm run db:snapshot`.
