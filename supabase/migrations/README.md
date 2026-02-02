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
