// scripts/buildChecklistSeed.mjs
//
// Builds supabase/content/001_species_checklist_seed.sql.
//
// The list of taxa comes from the published checklist:
//   Turtle Taxonomy Working Group 2025, Turtles of the World (10th Ed.),
//   extracted into supabase/content/data/ttwg_2025_taxa.json
//   (364 species and 188 named subspecies).
//
// Conservation status, CITES appendix and continents are added from the
// Turtle Conservancy "Turtles of the World" list
// (https://www.turtleconservancy.org/turtlesoftheworld/) for the taxa it
// covers. Only names, taxonomy and status are taken from it; its species
// accounts, photographs and range maps are theirs and are NOT copied.
//
// Usage:
//   npm run db:checklist-seed                 # fetches the Turtle Conservancy list
//   npm run db:checklist-seed -- records.json # uses a saved copy of it
//
// The generated SQL is safe to re-run: it updates the taxonomy/status columns
// of existing rows and never touches turtle_species_id, skip_reason or notes.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATUS_SOURCE_URL = 'https://turtle-encylopedia-api-production.up.railway.app/api/records';
const SOURCE_NAME = 'Turtles of the World, 10th Ed. (TTWG 2025)';
const TAXA_FILE = path.join(HERE, '..', 'supabase', 'content', 'data', 'ttwg_2025_taxa.json');
const OUT_FILE = path.join(HERE, '..', 'supabase', 'content', '001_species_checklist_seed.sql');

// Higher classification by family, as grouped in the checklist.
const FAMILY_GROUPS = {
  Chelidae: ['Cheloidea', 'Pleurodira'],
  Pelomedusidae: ['Pelomedusoidea', 'Pleurodira'],
  Podocnemididae: ['Pelomedusoidea', 'Pleurodira'],
  Cheloniidae: ['Chelonioidea', 'Cryptodira'],
  Dermochelyidae: ['Chelonioidea', 'Cryptodira'],
  Chelydridae: ['Chelydroidea', 'Cryptodira'],
  Dermatemydidae: ['Chelydroidea', 'Cryptodira'],
  Kinosternidae: ['Chelydroidea', 'Cryptodira'],
  Emydidae: ['Testudinoidea', 'Cryptodira'],
  Platysternidae: ['Testudinoidea', 'Cryptodira'],
  Geoemydidae: ['Testudinoidea', 'Cryptodira'],
  Testudinidae: ['Testudinoidea', 'Cryptodira'],
  Carettochelyidae: ['Trionychoidea', 'Cryptodira'],
  Trionychidae: ['Trionychoidea', 'Cryptodira'],
};

const EMPTY = new Set(['', '-', '\\-', 'NONE', 'none', 'N/A']);

/** Collapse whitespace; treat the list's placeholder values as missing. */
function clean(value) {
  if (typeof value !== 'string') return null;
  const text = value.replace(/\s+/g, ' ').trim();
  return EMPTY.has(text) ? null : text;
}

function sqlText(value) {
  return value === null || value === undefined ? 'null' : `'${String(value).replace(/'/g, "''")}'`;
}

function sqlTextArray(values) {
  if (!values || values.length === 0) return 'null';
  return `array[${values.map(sqlText).join(', ')}]::text[]`;
}

async function loadRecords(localPath) {
  if (localPath) {
    return JSON.parse(await readFile(localPath, 'utf8'));
  }
  const response = await fetch(STATUS_SOURCE_URL);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  return response.json();
}

/** Status details for one taxon from a Turtle Conservancy record. */
function toStatus(record) {
  const f = record.fields ?? {};
  const subfamily = clean(f['Subfamily']);
  return {
    scientific_name: clean(f['scientific name']),
    common_name: clean(f['Common Names']),
    // Their subfamily column holds a family name for a few taxa; ignore those.
    subfamily: subfamily && subfamily.endsWith('inae') ? subfamily : null,
    conservation_status: clean(f['IUCN or TFTSG Current Status']),
    iucn_red_list: clean(f['Current IUCN Red List']),
    tftsg_provisional: clean(f['TFTSG Provisional Assess']),
    cites_appendix: clean(f['CITES']),
    continents: Array.isArray(f['Continent (taxa)']) ? [...f['Continent (taxa)']].sort() : null,
    source_record_id: record.id,
  };
}

/** One checklist row: the taxon from the checklist, plus status details where known. */
function toRow(taxon, status) {
  const parts = taxon.scientific_name.split(' ');
  if (!/^[A-Z][a-z]+( [a-z-]+){1,2}$/.test(taxon.scientific_name)) {
    return { problem: `unexpected name format: "${taxon.scientific_name}"` };
  }
  const group = FAMILY_GROUPS[taxon.family];
  if (!group) return { problem: `no classification known for family "${taxon.family}" (${taxon.scientific_name})` };

  return {
    row: {
      scientific_name: taxon.scientific_name,
      taxon_rank: parts.length === 3 ? 'subspecies' : 'species',
      parent_species: parts.length === 3 ? `${parts[0]} ${parts[1]}` : null,
      genus: parts[0],
      family: taxon.family,
      subfamily: status?.subfamily ?? taxon.subfamily ?? null,
      superfamily: group[0],
      suborder: group[1],
      common_name: status?.common_name ?? taxon.common_name ?? null,
      conservation_status: status?.conservation_status ?? null,
      iucn_red_list: status?.iucn_red_list ?? null,
      tftsg_provisional: status?.tftsg_provisional ?? null,
      cites_appendix: status?.cites_appendix ?? null,
      continents: status?.continents ?? null,
      source_record_id: status?.source_record_id ?? null,
    },
  };
}

function buildSql(rows, retrievedOn) {
  const columns = [
    'scientific_name', 'taxon_rank', 'parent_species', 'genus', 'family', 'subfamily',
    'superfamily', 'suborder', 'common_name', 'conservation_status', 'iucn_red_list',
    'tftsg_provisional', 'cites_appendix', 'continents', 'source', 'source_record_id',
    'source_retrieved_on',
  ];

  const values = rows.map((r) => `  (${[
    sqlText(r.scientific_name), sqlText(r.taxon_rank), sqlText(r.parent_species), sqlText(r.genus),
    sqlText(r.family), sqlText(r.subfamily), sqlText(r.superfamily), sqlText(r.suborder),
    sqlText(r.common_name), sqlText(r.conservation_status), sqlText(r.iucn_red_list),
    sqlText(r.tftsg_provisional), sqlText(r.cites_appendix), sqlTextArray(r.continents),
    sqlText(SOURCE_NAME), sqlText(r.source_record_id), `date ${sqlText(retrievedOn)}`,
  ].join(', ')})`);

  const updatable = columns.filter((c) => c !== 'scientific_name');
  const species = rows.filter((r) => r.taxon_rank === 'species').length;
  const withStatus = rows.filter((r) => r.source_record_id !== null).length;

  return `-- ============================================================================
-- CONTENT: species checklist seed
-- ============================================================================
-- GENERATED by scripts/buildChecklistSeed.mjs. Do not edit by hand; re-run the
-- script instead.
--
-- Taxa:      Turtle Taxonomy Working Group 2025. Turtles of the World:
--            Annotated Checklist and Atlas of Taxonomy, Synonymy, Distribution,
--            and Conservation Status (10th Ed.). Chelonian Research
--            Monographs 10:1-575.
-- Status:    conservation status, CITES appendix and continents from the
--            Turtle Conservancy "Turtles of the World" list, for the
--            ${withStatus} taxa it covers (retrieved ${retrievedOn}). The other
--            ${rows.length - withStatus} taxa have no status recorded yet.
-- Rows:      ${rows.length} taxa (${species} species, ${rows.length - species} subspecies)
--
-- Requires migration 019. Safe to re-run: existing rows get their
-- taxonomy/status refreshed; turtle_species_id, skip_reason and notes are
-- never overwritten.
-- ============================================================================

begin;

-- 1. Taxa from the checklist ----------------------------------------------------
insert into public.species_checklist
  (${columns.join(', ')})
values
${values.join(',\n')}
on conflict (scientific_name) do update set
${updatable.map((c) => `  ${c} = excluded.${c}`).join(',\n')};

-- 2. Link checklist rows to existing Turterra profiles -------------------------
--    Matches on scientific name, ignoring case and the "ssp." marker
--    (e.g. "Terrapene carolina ssp. carolina" = "Terrapene carolina carolina").
update public.species_checklist c
set turtle_species_id = s.id
from public.turtle_species s
where c.turtle_species_id is null
  and lower(c.scientific_name)
      = lower(btrim(regexp_replace(s.species_scientific_name, '\\s+ssp\\.\\s+', ' ', 'i')))
  and not exists (
    select 1 from public.species_checklist linked where linked.turtle_species_id = s.id
  );

-- 3. Turterra profiles the checklist does not contain --------------------------
insert into public.species_checklist
  (scientific_name, taxon_rank, parent_species, genus, common_name, source, turtle_species_id)
select
  n.clean_name,
  case when n.word_count >= 3 then 'subspecies' else 'species' end,
  case when n.word_count >= 3 then split_part(n.clean_name, ' ', 1) || ' ' || split_part(n.clean_name, ' ', 2) end,
  split_part(n.clean_name, ' ', 1),
  s.species_common_name,
  'Turterra (not in the checklist)',
  s.id
from public.turtle_species s
cross join lateral (
  select
    initcap(split_part(x.name, ' ', 1)) || lower(substr(x.name, length(split_part(x.name, ' ', 1)) + 1)) as clean_name,
    array_length(string_to_array(x.name, ' '), 1) as word_count
  from (
    select btrim(regexp_replace(s.species_scientific_name, '\\s+ssp\\.\\s+', ' ', 'i')) as name
  ) x
) n
where s.species_scientific_name is not null
  and not exists (
    select 1 from public.species_checklist linked where linked.turtle_species_id = s.id
  )
on conflict (scientific_name) do nothing;

-- 4. Carry over the reasons already recorded in skipped_species ----------------
update public.species_checklist c
set skip_reason = k.reason
from public.skipped_species k
where c.skip_reason is null
  and lower(c.scientific_name) = lower(btrim(k.scientific_name));

commit;

-- Check the result:
--   select tracking_status, count(*) from public.admin_species_progress group by 1 order by 1;
`;
}

async function main() {
  const checklist = JSON.parse(await readFile(TAXA_FILE, 'utf8'));
  const payload = await loadRecords(process.argv[2]);
  const records = Array.isArray(payload) ? payload : payload.data;
  if (!Array.isArray(records)) throw new Error('Unexpected response shape: no record list found');

  const statusByName = new Map();
  for (const record of records) {
    const status = toStatus(record);
    if (status.scientific_name) statusByName.set(status.scientific_name, status);
  }

  const rows = [];
  const problems = [];
  const seen = new Set();

  for (const taxon of checklist.taxa) {
    if (seen.has(taxon.scientific_name)) { problems.push(`duplicate name: ${taxon.scientific_name}`); continue; }
    seen.add(taxon.scientific_name);
    const { row, problem } = toRow(taxon, statusByName.get(taxon.scientific_name));
    if (problem) { problems.push(problem); continue; }
    rows.push(row);
  }

  // A name on the Turtle Conservancy list that the checklist does not have
  // would mean one of the two has changed; surface it instead of guessing.
  for (const name of statusByName.keys()) {
    if (!seen.has(name)) problems.push(`on the Turtle Conservancy list but not in the checklist: ${name}`);
  }

  rows.sort((a, b) => a.scientific_name.localeCompare(b.scientific_name));

  const retrievedOn = new Date().toISOString().slice(0, 10);
  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, buildSql(rows, retrievedOn));

  console.log(`Wrote ${rows.length} taxa to ${path.relative(process.cwd(), OUT_FILE)}`);
  if (problems.length > 0) {
    console.log(`\n${problems.length} problem(s):`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
