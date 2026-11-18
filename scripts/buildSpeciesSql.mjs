// scripts/buildSpeciesSql.mjs
//
// Turns a species source file (supabase/content/species/<slug>.mjs) into the
// SQL that enters that profile: supabase/content/NNN_<slug>.sql.
//
// Usage:
//   npm run db:species -- common-box-turtle
//   npm run db:species -- common-box-turtle --no-validate   (skip the tag check)
//
// The source file holds every value together with the references it came
// from. This script checks it before writing any SQL:
//   - every source key used points to a reference in the file
//   - every tag (habitat, region, threat, ...) exists in the database, or is
//     declared under newVocabulary
//   - enum values and physical-feature fields are ones the database accepts
//   - every follow-up names taxa that are on the checklist
//
// The SQL it writes is safe to re-run: it replaces this one profile's rows
// with the contents of the file, inside a single transaction. It creates no
// tables, not even temporary ones: the Supabase SQL editor adds an
// "enable row level security" statement after the script for every table it
// sees created, which fails for a table that only lived inside the script. A new profile
// is created as a draft; an existing profile's draft/published status, slug
// and avatar are never touched. Follow-ups (sources to chase, listed under
// followUps) are only ever added, so edits made at /admin/follow-ups are kept.
//
// Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY from .env.local
// for the tag check (read-only, public key).

import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(HERE, '..', 'supabase', 'content');
const SPECIES_DIR = path.join(CONTENT_DIR, 'species');

const TEXT_SECTIONS = [
  'at_a_glance', 'identification', 'distribution', 'habitat', 'diet', 'hibernation',
  'nesting', 'unique_traits_and_qualities', 'conservation', 'predators', 'threats',
];
const MEASUREMENT_FIELDS = [
  'adult_weight', 'length_female_max_scl', 'length_male_max_scl', 'generally_larger',
  'lifespan_wild_min', 'lifespan_wild_max', 'lifespan_captivity_min', 'lifespan_captivity_max',
];
const FEATURE_FIELDS = [
  'head_texture_pattern', 'head_colors', 'jaw_color', 'neck_texture_pattern', 'neck_colors',
  'beak_shape', 'snout_shape', 'ear_color', 'eye_color', 'pupil_shape', 'chin_barbels_present',
  'chin_barbels_size', 'skin_limb_pattern', 'skin_limb_colors', 'webbing', 'front_claw_count',
  'rear_claw_count', 'tail_length', 'skin_scale_texture', 'tubercles_present', 'tubercle_locations',
  'carapace_shape', 'carapace_pattern', 'carapace_texture', 'carapace_colors', 'marginal_scute_shape',
  'nuchal_scute_present', 'vertebral_keel', 'plastron_pattern', 'plastron_colors',
  'plastron_scute_count', 'hinge_present', 'hinge_location', 'bridge_color', 'anterior_notch',
  'posterior_notch',
];
const SIZE_DIFFERENCE = ['Female', 'Male', 'Equal', 'Unknown'];
const POPULATION_TRENDS = ['Stable', 'Increasing', 'Decreasing', 'Unknown'];
const REFERENCE_TYPES = [
  'IUCN Assessment', 'IUCN Range Map', 'TFTSG Account', 'GBIF', 'iNaturalist', 'Journal Article',
  'Book', 'Website', 'Field Guide', 'Personal Communications',
];
const FOLLOW_UP_KINDS = ['book', 'paper', 'contact', 'data', 'other'];
const LIFE_STAGES = ['adult', 'juvenile', 'hatchling'];
const SEXES = [null, 'male', 'female'];

// Tag lists: where each one lives in the database.
const VOCABULARIES = {
  habitats: { table: 'habitats', column: 'habitat', join: 'turtle_species_habitats', fk: 'habitat', pk: 'id' },
  ecologies: { table: 'ecologies', column: 'ecology', join: 'turtle_species_ecologies', fk: 'ecology_id', pk: 'id' },
  habitatTypes: { table: 'habitat_types', column: 'habitat_type', join: 'turtle_species_habitat_types', fk: 'habitat_type_id', pk: 'id' },
  regions: { table: 'regions_general', column: 'region_name', join: 'turtle_species_regions_general', fk: 'region_id', pk: 'region_id' },
  threats: { table: 'threats_list', column: 'threat_name', join: 'turtle_species_threats', fk: 'threat_id', pk: 'id' },
  behaviors: { table: 'behaviors_general', column: 'behavior', join: 'turtle_species_behaviors_general', fk: 'behavior_id', pk: 'id' },
};
// Only these lists may gain new entries from a species file.
const EXTENDABLE = ['habitats', 'habitatTypes'];

const problems = [];
const problem = (message) => problems.push(message);

// ---------- SQL helpers ----------

function text(value) {
  if (value === null || value === undefined) return 'null';
  const s = String(value);
  if (!s.includes("'") && !s.includes('\\') && !s.includes('\n')) return `'${s}'`;
  let tag = 't';
  while (s.includes(`$${tag}$`)) tag += 't';
  const quoted = `$${tag}$${s}$${tag}$`;
  // A file pasted from Windows arrives with CR+LF line endings, which would be
  // stored inside any value that spans lines. Strip the carriage returns.
  return s.includes('\n') ? `replace(${quoted}, chr(13), '')` : quoted;
}
const number = (value) => (value === null || value === undefined ? 'null' : String(Number(value)));
const textArray = (values) =>
  !values || values.length === 0 ? 'null' : `array[${values.map(text).join(', ')}]::text[]`;
const list = (values) => values.map(text).join(', ');

// ---------- loading and checking ----------

async function fetchVocabulary(name) {
  const { table, column } = VOCABULARIES[name];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY must be set (see .env.local).');
  const response = await fetch(`${url}/rest/v1/${table}?select=${column}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`Could not read ${table}: ${response.status} ${(await response.text()).slice(0, 200)}`);
  return new Set((await response.json()).map((row) => row[column]).filter(Boolean));
}

function checkSources(where, sources, references, used) {
  if (!Array.isArray(sources) || sources.length === 0) {
    problem(`${where}: no sources given`);
    return;
  }
  for (const key of sources) {
    if (!references[key]) problem(`${where}: source "${key}" is not in references`);
    else used.add(key);
  }
}

/** Every scientific name and genus on the checklist (the file the checklist seed is built from). */
async function loadChecklistNames() {
  const { taxa } = JSON.parse(await readFile(path.join(CONTENT_DIR, 'data', 'ttwg_2025_taxa.json'), 'utf8'));
  const names = new Set();
  for (const taxon of taxa) {
    names.add(taxon.scientific_name);
    names.add(taxon.scientific_name.split(' ')[0]);
  }
  return names;
}

function check(species, vocabularies, checklistNames) {
  const used = new Set();
  const references = species.references ?? {};

  if (!/^[A-Z][a-z]+( [a-z-]+){1,2}$/.test(species.scientificName ?? '')) problem('scientificName is missing or not a binomial/trinomial');
  if (!species.commonName) problem('commonName is missing');
  if (!['species', 'subspecies'].includes(species.rank)) problem('rank must be "species" or "subspecies"');
  if (species.rank === 'subspecies' && !species.parent) problem('a subspecies needs parent (the scientific name of its species)');
  if (species.rank === 'species' && species.parent) problem('a species must not have a parent');
  if (!species.genus) problem('genus is missing');

  for (const [key, ref] of Object.entries(references)) {
    if (!REFERENCE_TYPES.includes(ref.type)) problem(`reference ${key}: type "${ref.type}" is not one the database accepts`);
    for (const field of ['citationFull', 'citationShort', 'authors', 'year', 'title', 'accessDate']) {
      if (!ref[field]) problem(`reference ${key}: ${field} is missing`);
    }
  }

  for (const section of Object.keys(species.text ?? {})) {
    if (!TEXT_SECTIONS.includes(section)) problem(`text.${section} is not a section the profile has`);
  }
  for (const section of TEXT_SECTIONS) {
    const entry = species.text?.[section];
    if (entry === undefined) problem(`text.${section} is missing (use null to leave it empty on purpose)`);
    else if (entry !== null) {
      if (!entry.body || !entry.body.trim()) problem(`text.${section}: body is empty (use null to leave it empty on purpose)`);
      checkSources(`text.${section}`, entry.sources, references, used);
    }
  }

  const m = species.measurements ?? {};
  for (const field of Object.keys(m)) {
    if (field !== 'sources' && !MEASUREMENT_FIELDS.includes(field)) problem(`measurements.${field} is not a field the database has`);
  }
  for (const field of MEASUREMENT_FIELDS) {
    const value = m[field];
    if (value === undefined) problem(`measurements.${field} is missing (use null when unknown)`);
    if (value === null || value === undefined) continue;
    if (field === 'generally_larger') {
      if (!SIZE_DIFFERENCE.includes(value)) problem(`measurements.generally_larger must be one of ${SIZE_DIFFERENCE.join(', ')}`);
    } else if (typeof value !== 'number') problem(`measurements.${field} must be a number`);
    checkSources(`measurements.${field}`, m.sources?.[field], references, used);
  }

  for (const [i, row] of (species.conservation ?? []).entries()) {
    if (!row.status) problem(`conservation[${i}]: status (IUCN abbreviation) is missing`);
    if (!row.year) problem(`conservation[${i}]: year is missing`);
    checkSources(`conservation[${i}]`, row.sources, references, used);
  }
  for (const [i, row] of (species.population ?? []).entries()) {
    if (!POPULATION_TRENDS.includes(row.trend)) problem(`population[${i}]: trend must be one of ${POPULATION_TRENDS.join(', ')}`);
    checkSources(`population[${i}]`, row.sources, references, used);
  }

  for (const name of Object.keys(VOCABULARIES)) {
    const tags = species[name] ?? [];
    const added = species.newVocabulary?.[name] ?? [];
    if (added.length > 0 && !EXTENDABLE.includes(name)) problem(`newVocabulary.${name}: this list cannot be extended from a species file`);
    if (new Set(tags).size !== tags.length) problem(`${name}: contains a duplicate`);
    if (vocabularies) {
      for (const tag of tags) {
        if (!vocabularies[name].has(tag) && !added.includes(tag)) {
          problem(`${name}: "${tag}" is not in the database (declare it under newVocabulary.${name} if it should be added)`);
        }
      }
      for (const tag of added) {
        // Harmless (the SQL only adds a tag when it is missing), but worth knowing.
        if (vocabularies[name].has(tag)) console.warn(`Note: newVocabulary.${name} "${tag}" is already in the database.`);
        if (!tags.includes(tag)) problem(`newVocabulary.${name}: "${tag}" is declared but not used`);
      }
    }
  }
  if ((species.habitats ?? []).length + (species.ecologies ?? []).length > 0) {
    checkSources('tags', species.tagSources, references, used);
  }

  const variants = new Set();
  for (const [i, row] of (species.physicalFeatures ?? []).entries()) {
    const label = `physicalFeatures[${i}] (${row.life_stage}${row.sex ? ' ' + row.sex : ''})`;
    if (!LIFE_STAGES.includes(row.life_stage)) problem(`${label}: life_stage must be one of ${LIFE_STAGES.join(', ')}`);
    if (!SEXES.includes(row.sex ?? null)) problem(`${label}: sex must be "male", "female" or null`);
    const id = `${row.life_stage}/${row.sex ?? ''}`;
    if (variants.has(id)) problem(`${label}: this variant appears twice`);
    variants.add(id);
    for (const field of Object.keys(row.values ?? {})) {
      if (!FEATURE_FIELDS.includes(field)) problem(`${label}: "${field}" is not a feature the database has`);
    }
    checkSources(label, row.sources, references, used);
  }

  const followUpKeys = new Set();
  for (const [i, item] of (species.followUps ?? []).entries()) {
    const label = `followUps[${i}]`;
    if (!FOLLOW_UP_KINDS.includes(item.kind)) problem(`${label}: kind must be one of ${FOLLOW_UP_KINDS.join(', ')}`);
    if (!item.title || !item.title.trim()) problem(`${label}: title is missing`);
    if (!Array.isArray(item.taxa) || item.taxa.length === 0) problem(`${label}: taxa is empty (scientific names or a genus)`);
    for (const taxon of item.taxa ?? []) {
      if (!checklistNames.has(taxon)) problem(`${label}: "${taxon}" is not a scientific name or genus on the checklist`);
    }
    const key = `${item.kind}|${item.title}`;
    if (followUpKeys.has(key)) problem(`${label}: the same kind and title appear twice`);
    followUpKeys.add(key);
  }

  for (const key of Object.keys(references)) {
    if (!used.has(key) && !references[key].general) problem(`reference ${key} is never cited (mark it general: true if it is background)`);
  }
}

// ---------- SQL ----------

function buildSql(species, slug) {
  const refs = species.references;
  const cite = (sources) => (sources ?? []).map((k) => refs[k]?.citationShort ?? k).join('; ');
  const name = species.scientificName;
  // The profile this file is about, looked up by name wherever it is needed.
  const isProfile = `species_scientific_name = ${text(name)}`;
  const sp = `(select id from public.turtle_species where ${isProfile})`;
  const fromProfile = `from public.turtle_species p where p.${isProfile}`;
  const out = [];
  const add = (...lines) => out.push(...lines);

  const emptyText = TEXT_SECTIONS.filter((s) => species.text[s] === null);
  const emptyMeasurements = MEASUREMENT_FIELDS.filter((f) => species.measurements[f] === null);

  add(
    '-- ============================================================================',
    `-- CONTENT: ${species.commonName} (${name})`,
    '-- ============================================================================',
    `-- GENERATED by scripts/buildSpeciesSql.mjs from supabase/content/species/${slug}.mjs.`,
    '-- Do not edit by hand: change the source file and run `npm run db:species -- ' + slug + '`.',
    '--',
    '-- Replaces this profile\'s text, measurements, tags, physical features and',
    '-- references with the contents of the source file. Safe to re-run. A new',
    '-- profile is created as a DRAFT; an existing profile keeps its status, slug',
    '-- and avatar.',
    '--',
    `-- Rank: ${species.rank}${species.parent ? ` of ${species.parent}` : ''}`,
    '--',
    '-- References used:',
    ...Object.values(refs).map((r) => `--   ${r.citationShort}: ${r.citationFull}`.replace(/\n/g, ' ')),
    '--',
    '-- Left empty because the sources do not support a value:',
    ...(emptyText.length + emptyMeasurements.length === 0
      ? ['--   (nothing)']
      : [...emptyText.map((s) => `--   text: ${s}`), ...emptyMeasurements.map((f) => `--   measurement: ${f}`)]),
    ...(species.notes ?? []).length > 0 ? ['--', '-- Notes for review:', ...species.notes.map((n) => `--   * ${n}`)] : [],
    '-- ============================================================================',
    '',
    'begin;',
    ''
  );

  // 1. profile row
  add('-- 1. Profile row ---------------------------------------------------------------');
  if (species.rank === 'subspecies') {
    add(
      'do $$ begin',
      `  if not exists (select 1 from public.turtle_species where species_scientific_name = ${text(species.parent)}) then`,
      `    raise exception 'The parent species % has no profile row yet; run its file first', ${text(species.parent)};`,
      '  end if;',
      'end $$;',
      ''
    );
  }
  add(
    'insert into public.turtle_species',
    '  (species_common_name, species_scientific_name, tax_parent_genus, status, taxon_rank, parent_species_id)',
    'select',
    `  ${text(species.commonName)}, ${text(name)},`,
    `  (select id from public.turtle_taxonomy_genuses where genus_scientific_name = ${text(species.genus)}),`,
    `  'draft', ${text(species.rank)},`,
    species.rank === 'subspecies'
      ? `  (select id from public.turtle_species where species_scientific_name = ${text(species.parent)})`
      : '  null',
    `where not exists (select 1 from public.turtle_species where species_scientific_name = ${text(name)});`,
    '',
    'do $$ begin',
    `  if (select count(*) from public.turtle_species where ${isProfile}) <> 1 then`,
    `    raise exception 'Expected exactly one profile row for %', ${text(name)};`,
    '  end if;',
    'end $$;',
    '',
    'update public.turtle_species',
    `set other_common_names = ${textArray(species.otherCommonNames)},`,
    `    limited_information_toggle = ${species.limitedInformation ? 'true' : 'false'},`,
    `    limited_information_description = ${text(species.limitedInformation ?? null)}`,
    `where id = ${sp};`,
    ''
  );

  // 2. text
  add('-- 2. Written sections ----------------------------------------------------------');
  for (const section of TEXT_SECTIONS) {
    if (species.text[section]) add(`--    ${section}: ${cite(species.text[section].sources)}`);
  }
  add(
    `delete from public.turtle_species_section_descriptions where species_id = ${sp};`,
    'insert into public.turtle_species_section_descriptions',
    `  (species_id, ${TEXT_SECTIONS.join(', ')})`,
    'select p.id,',
    TEXT_SECTIONS.map((s) => `  ${text(species.text[s] ? species.text[s].body.trim() : null)}`).join(',\n'),
    `${fromProfile};`,
    ''
  );

  // 3. measurements
  add('-- 3. Measurements (lengths in cm, weight in g, lifespans in years) -------------');
  for (const field of MEASUREMENT_FIELDS) {
    if (species.measurements[field] !== null) add(`--    ${field}: ${cite(species.measurements.sources[field])}`);
  }
  add(
    `delete from public.turtle_species_measurements where species_id = ${sp};`,
    'insert into public.turtle_species_measurements',
    `  (species_id, ${MEASUREMENT_FIELDS.join(', ')})`,
    'select p.id,',
    '  ' + MEASUREMENT_FIELDS.map((f) =>
      f === 'generally_larger'
        ? (species.measurements[f] ? `${text(species.measurements[f])}::public.sex_size_difference` : 'null')
        : number(species.measurements[f])
    ).join(', '),
    `${fromProfile};`,
    ''
  );

  // 4. conservation + population
  add('-- 4. Conservation status and population ----------------------------------------');
  add(`delete from public.turtle_species_conservation_history where species_id = ${sp};`);
  for (const row of species.conservation ?? []) {
    add(
      `--    ${row.status} ${row.year}: ${cite(row.sources)}`,
      'insert into public.turtle_species_conservation_history',
      '  (species_id, conservation_status, year_status_assigned, date_status_assigned, out_of_date, out_of_date_description, self_assigned_conservation_status)',
      'select p.id, s.id,',
      `  ${text(String(row.year))}, ${row.date ? `date ${text(row.date)}` : 'null'}, ${row.outOfDate ? 'true' : 'null'}, ${text(row.outOfDateDescription ?? null)},`,
      row.selfAssignedStatus
        ? `  (select id from public.conservation_statuses where abbreviation = ${text(row.selfAssignedStatus)})`
        : '  null',
      'from public.turtle_species p, public.conservation_statuses s',
      `where p.${isProfile} and s.abbreviation = ${text(row.status)};`
    );
  }
  add(`delete from public.turtle_species_population_estimate_history where species_id = ${sp};`);
  for (const row of species.population ?? []) {
    add(
      `--    population ${row.year ?? ''}: ${cite(row.sources)}`,
      'insert into public.turtle_species_population_estimate_history',
      '  (species_id, year_of_estimate, date_of_estimate, population_estimate, population_trend)',
      `select p.id, ${text(row.year ? String(row.year) : null)}, null, ${text(row.estimate ?? null)}, ${text(row.trend)}::public.population_trend`,
      `${fromProfile};`
    );
  }
  add(
    'do $$ begin',
    `  if (select count(*) from public.turtle_species_conservation_history where species_id = ${sp}) <> ${(species.conservation ?? []).length} then`,
    "    raise exception 'A conservation status abbreviation did not match conservation_statuses';",
    '  end if;',
    'end $$;',
    ''
  );

  // 5. tags
  add(`-- 5. Tags (${cite(species.tagSources)}) `.padEnd(80, '-'));
  for (const [key, vocab] of Object.entries(VOCABULARIES)) {
    const tags = species[key] ?? [];
    const added = species.newVocabulary?.[key] ?? [];
    for (const tag of added) {
      add(
        `insert into public.${vocab.table} (${vocab.column})`,
        `select ${text(tag)} where not exists (select 1 from public.${vocab.table} where ${vocab.column} = ${text(tag)});   -- NEW tag`
      );
    }
    add(`delete from public.${vocab.join} where species_id = ${sp};`);
    if (tags.length > 0) {
      add(
        `insert into public.${vocab.join} (species_id, ${vocab.fk})`,
        `select p.id, v.${vocab.pk} from public.turtle_species p, public.${vocab.table} v`,
        `where p.${isProfile} and v.${vocab.column} in (${list(tags)});`,
        'do $$ begin',
        `  if (select count(*) from public.${vocab.join} where species_id = ${sp}) <> ${tags.length} then`,
        `    raise exception 'Expected ${tags.length} rows in ${vocab.join}: a tag name did not match ${vocab.table}';`,
        '  end if;',
        'end $$;'
      );
    }
  }
  add('');

  // 6. physical features
  add('-- 6. Physical features (one row per variant) -----------------------------------');
  add(`delete from public.turtle_species_physical_features_new where species_id = ${sp};`);
  for (const row of species.physicalFeatures ?? []) {
    const fields = FEATURE_FIELDS.filter((f) => row.values[f] !== undefined && row.values[f] !== null);
    add(
      `--    ${row.life_stage}${row.sex ? ' ' + row.sex : ''}: ${cite(row.sources)}`,
      'insert into public.turtle_species_physical_features_new',
      `  (species_id, life_stage, sex${fields.map((f) => `, ${f}`).join('')})`,
      `select p.id, ${text(row.life_stage)}, ${text(row.sex ?? null)}${fields.map((f) => `,\n  ${text(String(row.values[f]))}`).join('')}`,
      `${fromProfile};`
    );
  }
  add('');

  // 7. references
  add('-- 7. References ----------------------------------------------------------------');
  add(`delete from public.turtle_species_references where species_id = ${sp};`);
  for (const ref of Object.values(refs)) {
    add(
      'insert into public.turtle_species_references',
      '  (species_id, reference_type, citation_full, citation_short, authors, year, title, source_name, url, doi, access_date, notes)',
      `select p.id, ${text(ref.type)}::public.reference_type,`,
      `  ${text(ref.citationFull)},`,
      `  ${text(ref.citationShort)}, ${text(ref.authors)}, ${text(String(ref.year))},`,
      `  ${text(ref.title)},`,
      `  ${text(ref.sourceName ?? null)}, ${text(ref.url ?? null)}, ${text(ref.doi ?? null)}, date ${text(ref.accessDate)}, ${text(ref.notes ?? null)}`,
      `${fromProfile};`
    );
  }
  add('');

  // 8. checklist link
  add(
    '-- 8. Link the profile to its checklist entry ------------------------------------',
    'update public.species_checklist c',
    'set turtle_species_id = p.id',
    'from public.turtle_species p',
    `where p.${isProfile} and c.scientific_name = ${text(name)} and c.turtle_species_id is null;`,
    ''
  );

  // 9. follow-ups
  const followUps = species.followUps ?? [];
  if (followUps.length > 0) {
    add(
      '-- 9. Follow-ups: sources to chase for what is still empty ----------------------',
      '--    Only added when missing (matched on kind and title), so anything changed at',
      '--    /admin/follow-ups is kept. Skipped if migration 024 has not been run yet.',
      'do $followups$',
      'begin',
      "  if to_regclass('public.species_followups') is null then",
      "    raise notice 'species_followups does not exist yet (migration 024): follow-ups not added';",
      '    return;',
      '  end if;'
    );
    for (const item of followUps) {
      add(
        '  insert into public.species_followups (taxa, kind, title, would_fill, url, notes)',
        `  values (${textArray(item.taxa)}, ${text(item.kind)},`,
        `    ${text(item.title.trim())},`,
        `    ${text(item.wouldFill ?? null)},`,
        `    ${text(item.url ?? null)}, ${text(item.notes ?? null)})`,
        '  on conflict (kind, title) do nothing;'
      );
    }
    add('end $followups$;', '');
  }

  add('commit;', '');
  return out.join('\n');
}

async function outputPath(slug) {
  const stem = slug.replace(/-/g, '_');
  const files = (await readdir(CONTENT_DIR)).filter((f) => /^\d{3}_.*\.sql$/.test(f));
  const existing = files.find((f) => f.slice(4, -4) === stem);
  if (existing) return path.join(CONTENT_DIR, existing);
  const next = Math.max(0, ...files.map((f) => Number(f.slice(0, 3)))) + 1;
  return path.join(CONTENT_DIR, `${String(next).padStart(3, '0')}_${stem}.sql`);
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  const validate = !args.includes('--no-validate');
  if (!slug) {
    console.error('Usage: npm run db:species -- <slug>   (the file name in supabase/content/species, without .mjs)');
    process.exit(1);
  }

  const species = (await import(pathToFileURL(path.join(SPECIES_DIR, `${slug}.mjs`)).href)).default;

  let vocabularies = null;
  if (validate) {
    vocabularies = {};
    for (const name of Object.keys(VOCABULARIES)) vocabularies[name] = await fetchVocabulary(name);
  } else {
    console.warn('Skipping the tag check (--no-validate).');
  }

  check(species, vocabularies, await loadChecklistNames());
  if (problems.length > 0) {
    console.error(`${slug}: ${problems.length} problem(s), no SQL written:`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  const file = await outputPath(slug);
  await writeFile(file, buildSql(species, slug));
  console.log(`Wrote ${path.relative(process.cwd(), file)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
