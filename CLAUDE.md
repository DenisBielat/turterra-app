# Turterra

A turtle species encyclopedia with care guides and a community section.
Next.js (App Router) on Vercel, Supabase for data and auth, Cloudinary for
species photos, Mapbox for range maps.

## Commands

- `npm run dev`, `npm run build`
- `npm run lint` (ESLint on `src/`), `npx tsc --noEmit`
- `npm run db:species -- <slug>` builds a species profile's SQL from its source file
- `npm run db:checklist-seed` rebuilds the species checklist seed
- `npm run db:snapshot -- <token>` regenerates `docs/supabase-schema.md`
- `npm run photo:inat -- <observation link>` looks up an iNaturalist photo's licence and credit

## Database

- Supabase project ref: `nznxvfsdsxeflwzlrpvj`. Schemas: `public` (species,
  community, profiles), `care_guides` (care guides; code uses
  `.schema('care_guides')`), `private` (not exposed through the API).
- `docs/supabase-schema.md` is the structure reference (tables, columns,
  constraints, policies, functions). Refresh it after schema changes: run
  `select private.export_schema_snapshot();` in the database, then
  `npm run db:snapshot -- <token>`.
- The site uses only the publishable key (`NEXT_PUBLIC_SUPABASE_KEY`). A
  secret key is needed only by the import scripts in `scripts/` that read
  `SUPABASE_SERVICE_ROLE_KEY`. Never put a secret key in the site, a cloud
  environment or the repo.
- Row-level security is on everywhere. Species content tables are public
  read-only; writes happen through SQL files, never from the app.

## SQL files

`supabase/migrations/` changes structure; `supabase/content/` enters data.
Both are numbered and run in number order. See `supabase/migrations/README.md`.

- Write every new file so it is safe to run more than once.
- Look rows up by name or slug, never by a hard-coded id.
- Rehearse against a scratch Postgres before proposing a file, and ask the
  owner before applying anything to the live database.
- Code must keep working if it deploys before or after its migration.

## Species profiles

One profile per row of `turtle_species`. Species and subspecies each get
their own profile with their own content: nothing is inherited or shared
between a species and its subspecies. A subspecies has
`taxon_rank = 'subspecies'` and `parent_species_id`.

`status` is `draft` or `published`. New profiles start as drafts, which only
admins can see. Publishing is the owner's decision.

The checklist of what exists is `species_checklist` (552 taxa from Turtles of
the World, 10th Ed., TTWG 2025). Progress is at `/admin/species`.

Sources that could not be used yet (a print-only book, a paper behind a
paywall, an author to ask) are tracked at `/admin/follow-ups`
(`species_followups`), filed under a species, subspecies or genus. When a
profile is left with gaps a known source would fill, list it under
`followUps` in the species file.

### Writing a profile

1. Research from primary sources. In order of preference: the IUCN SSC
   Tortoise and Freshwater Turtle Specialist Group species account
   (iucn-tftsg.org), the IUCN Red List assessment, the TTWG checklist entry,
   peer-reviewed papers. Wikipedia, GBIF and iNaturalist are for
   cross-checking and links, not as the origin of a fact.
2. Write `supabase/content/species/<slug>.mjs`. Every value carries the keys
   of the references it came from.
3. `npm run db:species -- <slug>` checks the file and writes the numbered SQL.
4. The owner reviews, the SQL is run, and the result is read back and compared.

Rules that matter here:

- Accuracy over completeness. If the sources do not support a value, leave it
  `null` and say so in `notes`. Never fill a gap from general knowledge.
- Check which taxon a source statement is about. Older accounts often lump
  what the current checklist splits (the 2015 *Terrapene carolina* account
  covers six subspecies, three of which are now separate species).
- Text is original prose in the house style: plain, specific, metric units,
  roughly 80 to 250 words a section. Do not copy source wording or use
  another site's text or photos.
- Tags (habitats, regions, threats, behaviours, ecologies, habitat types)
  must already exist in the database, or be declared under `newVocabulary`
  (habitats and habitat types only) and pointed out to the owner.
- Physical features are stored per variant: adult (no sex), adult male,
  adult female, hatchling. Give a value only where a source states it.

## Photos

Species photos live in Cloudinary. A profile's gallery is every image in the
folder `Turtle Species Photos/<slug>`; the physical-feature photos are in
`Turtle Species Photos/<slug>/physical-features`. An image in a species
folder shows on the live page straight away, whatever its permission status.

- The owner chooses the photos and sends links. For iNaturalist that is the
  observation link (a photo link cannot be looked up):
  `npm run photo:inat -- <link>` prints the licence, credit, file and the
  values for the fields below.
- Fields on every photo: `author`, `image_source`, `image_url` (the source
  page), `asset_type`, `life_stage`, `life_stages_descriptor` (sex, when
  known), `license`, `permission_status`. One photo per species has
  `primary_photo` = `true`.
- A physical-feature photo also carries one tag: `carapace`, `plastron`,
  `head-and-neck` or `skin-and-limbs`.
- Only photos whose licence allows reuse go up (CC0, CC BY, CC BY-NC and
  their share-alike forms). "All rights reserved" needs the photographer's
  written permission first.
- Life stage and sex come from the photo and the owner; an iNaturalist
  annotation is a suggestion, and iNaturalist has no hatchling stage.
- Ask the owner before uploading, changing or deleting anything in Cloudinary.

## Conventions

- Scientific names: genus capitalised, epithets lower case; subspecies as a
  plain trinomial (`Terrapene carolina carolina`, no "ssp.").
- Slugs are generated by the database from the common name; changing a common
  name changes the slug and the Cloudinary folder the photos load from.
- Do not create a pull request unless asked.
