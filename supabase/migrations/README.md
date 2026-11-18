# Supabase SQL files

Two folders, both numbered. Run files in number order; every file from 017
onwards is safe to run more than once.

- `supabase/migrations/` changes the **structure** of the database (tables,
  columns, functions, permissions).
- `supabase/content/` enters or corrects **data** (species profiles, the
  checklist, fixes).

To run a file by hand: Supabase Dashboard, SQL Editor, New query, paste the
file, Run.

## Migrations

| # | File | What it does |
|---|------|--------------|
| 001 | `001_create_profiles_table.sql` | Profiles table with row-level security |
| 002 | `002_create_updated_at_trigger.sql` | Keeps `updated_at` current |
| 003 | `003_create_username_functions.sql` | Username validation functions |
| 004 | `004_create_reserved_usernames.sql` | Reserved usernames list |
| 005 | `005_create_channels_table.sql` | Community channels |
| 006 | `006_create_posts_table.sql` | Community posts |
| 007 | `007_create_comments_table.sql` | Comments |
| 008 | `008_create_votes_table.sql` | Votes |
| 009 | `009_create_vote_triggers.sql` | Vote score triggers |
| 010 | `010_create_hot_score_algorithm.sql` | Hot score ranking |
| 011 | `011_create_comment_count_trigger.sql` | Comment counts |
| 012 | `012_create_supporting_tables.sql` | Saved posts, reports and other supporting tables |
| 013 | `013_create_helper_views.sql` | Channel and community statistics views |
| 014 | `014_create_featured_species_table.sql` | Featured species |
| 015 | `015_add_icon_svg_to_channels.sql` | Channel icons |
| 016 | `016_add_role_and_restricted_channels.sql` | User roles; restricted channels |
| 017 | `017_admin_helper_and_lock_profile_role.sql` | `is_admin()`; users can no longer change their own `role` / `is_verified` |
| 018 | `018_add_species_status.sql` | `turtle_species.status` (`draft` / `published`); drafts are hidden from the public |
| 019 | `019_create_species_checklist.sql` | `species_checklist` table and the `admin_species_progress` view behind `/admin/species` |
| 020 | `020_add_subspecies_support.sql` | `taxon_rank` and `parent_species_id`: a subspecies has its own profile linked to its species |
| 021 | `021_fix_species_slug_function.sql` | Slug generator hyphenates every space, not just the first |
| 022 | `022_schema_snapshot_export.sql` | Lets the schema snapshot be produced without a secret key |
| 023 | `023_parent_species_lookup.sql` | Subspecies pages can name their species while its profile is a draft |

The care guide tables live in the `care_guides` schema; their definitions are
in `docs/turterra_*_schema.sql`.

## Content

| # | File | What it does |
|---|------|--------------|
| 001 | `001_species_checklist_seed.sql` | The 552-taxon checklist. Generated: rebuild with `npm run db:checklist-seed`, do not edit |
| 002 | `002_fix_chrysemys_picta_name.sql` | Scientific name capitalisation |
| 003 | `003_box_turtle_species_and_subspecies.sql` | Eastern Box Turtle becomes a subspecies of *Terrapene carolina* |
| 004 | `004_common_box_turtle.sql` | Common Box Turtle profile (a draft). Generated from `species/common-box-turtle.mjs` |
| 005 | `005_eastern_box_turtle.sql` | Eastern Box Turtle profile (already published, so running it changes the live page). Generated from `species/eastern-box-turtle.mjs` |

The checklist's list of taxa is `supabase/content/data/ttwg_2025_taxa.json`
(364 species and 188 named subspecies from Turtles of the World, 10th Ed.,
TTWG 2025); conservation status is added from the Turtle Conservancy list for
the taxa it covers.

Species profiles are written in `supabase/content/species/<slug>.mjs`, where
every value sits next to the references it came from and the notes say what
was left empty and why. `npm run db:species -- <slug>` checks that file and
writes the numbered SQL. To change a profile, edit the `.mjs` file and rebuild;
do not edit the generated SQL. New profiles are entered as drafts, so running
a file never publishes anything by itself.

## Schema reference

`docs/supabase-schema.md` lists every table, column, constraint, policy and
function as of the date at the top of the file. To refresh it:

1. In the SQL editor run `select private.export_schema_snapshot();` and copy
   the token it returns (valid for 15 minutes, works once).
2. `npm run db:snapshot -- <token>`
