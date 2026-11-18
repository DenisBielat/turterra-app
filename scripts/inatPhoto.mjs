// scripts/inatPhoto.mjs
//
// Looks up an iNaturalist observation and prints, for each of its photos, what
// goes into the Cloudinary fields for a species photo: photographer, source
// link, licence and whether it can be used, life stage and sex.
//
// Usage:
//   npm run photo:inat -- https://www.inaturalist.org/observations/302976000
//   npm run photo:inat -- 302976000 --photo 2            (only the second photo)
//   npm run photo:inat -- 302976000 --expect "Terrapene carolina carolina"
//   npm run photo:inat -- 302976000 --json               (machine-readable)
//
// It needs the OBSERVATION link, not the photo link: iNaturalist's API cannot
// look a photo up by its own id. On a photo page, the observation is linked
// under "Associated observations".
//
// It only reads from iNaturalist. Nothing is uploaded or changed.

const API = 'https://api.inaturalist.org/v1';
// iNaturalist asks automated clients to identify themselves; nothing personal goes in here.
const USER_AGENT = 'species-research-client/1.0';

// Controlled terms iNaturalist uses for annotations.
const LIFE_STAGE_ATTRIBUTE = 1;
const SEX_ATTRIBUTE = 9;
const ALIVE_OR_DEAD_ATTRIBUTE = 17;
const LIFE_STAGE_VALUES = { 2: 'adult', 8: 'juvenile', 7: 'egg' };
const SEX_VALUES = { 10: 'female', 11: 'male' };
const DEAD_VALUE = 19;

// What each iNaturalist licence code allows, and the Cloudinary permission_status it maps to.
const LICENCES = {
  cc0: { name: 'CC0 (public domain)', status: 'have_permission', terms: 'No conditions. Credit the photographer anyway.' },
  'cc-by': { name: 'CC BY', status: 'have_permission', terms: 'Credit the photographer.' },
  'cc-by-sa': { name: 'CC BY-SA', status: 'have_permission', terms: 'Credit the photographer. An edited version has to carry the same licence.' },
  'cc-by-nc': { name: 'CC BY-NC', status: 'have_permission', terms: 'Credit the photographer. Non-commercial use only.' },
  'cc-by-nc-sa': { name: 'CC BY-NC-SA', status: 'have_permission', terms: 'Credit the photographer. Non-commercial use only; an edited version has to carry the same licence.' },
  'cc-by-nd': { name: 'CC BY-ND', status: 'have_permission', terms: 'Credit the photographer. Must be shown unaltered, so not for the cropped avatar; prefer another photo where there is one.' },
  'cc-by-nc-nd': { name: 'CC BY-NC-ND', status: 'have_permission', terms: 'Credit the photographer. Non-commercial, and must be shown unaltered, so not for the cropped avatar; prefer another photo where there is one.' },
};
const ALL_RIGHTS_RESERVED = {
  name: 'All rights reserved',
  status: 'need_to_ask',
  terms: 'Not licensed for reuse. Do not put it on the site without the photographer\'s written permission.',
};

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const options = { json: false, photo: null, expect: null, target: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') options.json = true;
    else if (arg === '--photo') options.photo = Number(argv[(i += 1)]);
    else if (arg === '--expect') options.expect = argv[(i += 1)];
    else if (!options.target) options.target = arg;
  }
  return options;
}

function observationId(target) {
  if (/^\d+$/.test(target)) return target;
  const match = target.match(/inaturalist\.org\/observations\/(\d+)/);
  if (match) return match[1];
  if (/inaturalist\.org\/photos\/\d+/.test(target)) {
    fail(
      'That is a photo link. iNaturalist cannot look a photo up by its own id.\n' +
        'Open the photo page, follow the link under "Associated observations", and pass that link instead.'
    );
  }
  return null;
}

/** The value of an annotation, ignoring ones the community has voted down. */
function annotation(observation, attribute) {
  const found = (observation.annotations ?? []).find(
    (a) => a.controlled_attribute_id === attribute && (a.vote_score ?? 0) >= 0
  );
  return found ? found.controlled_value_id : null;
}

function describe(observation, expect) {
  const warnings = [];
  const taxon = observation.taxon ?? {};
  const user = observation.user ?? {};

  const stage = LIFE_STAGE_VALUES[annotation(observation, LIFE_STAGE_ATTRIBUTE)] ?? null;
  const sex = SEX_VALUES[annotation(observation, SEX_ATTRIBUTE)] ?? null;

  if (observation.quality_grade !== 'research') {
    warnings.push(`Identification is not research grade (${observation.quality_grade}): check it is the right turtle.`);
  }
  if (observation.captive) warnings.push('Marked captive / not wild.');
  if (annotation(observation, ALIVE_OR_DEAD_ATTRIBUTE) === DEAD_VALUE) warnings.push('Annotated as dead.');
  if (stage === 'egg') warnings.push('Annotated as an egg, which the life stage field has no option for.');
  if (!stage) warnings.push('No life stage annotation: decide it from the photo.');
  if (stage === 'juvenile') warnings.push('iNaturalist has no hatchling stage: "juvenile" may be a hatchling. Decide from the photo.');

  if (expect && taxon.name !== expect) {
    if (taxon.name?.startsWith(`${expect} `)) {
      warnings.push(`Identified as the subspecies ${taxon.name}, which belongs to ${expect}.`);
    } else if (expect.startsWith(`${taxon.name} `)) {
      warnings.push(
        `Identified only as ${taxon.name}, not as ${expect}. Confirm the subspecies (for example from where it was seen) before using it on that page.`
      );
    } else {
      warnings.push(`Identified as ${taxon.name}, not ${expect}.`);
    }
  }

  const photos = (observation.photos ?? []).map((photo, index) => {
    const licence = photo.license_code
      ? LICENCES[photo.license_code] ?? {
          name: photo.license_code,
          status: 'need_to_ask',
          terms: 'Licence code not recognised: check it by hand.',
        }
      : ALL_RIGHTS_RESERVED;
    return {
      position: index + 1,
      photoId: photo.id,
      licenceCode: photo.license_code ?? null,
      licence: licence.name,
      terms: licence.terms,
      attribution: photo.attribution,
      width: photo.original_dimensions?.width ?? null,
      height: photo.original_dimensions?.height ?? null,
      // The largest file iNaturalist serves (up to 2048 px on the long side).
      file: photo.url ? photo.url.replace(/\/square\.(\w+)(\?.*)?$/, '/original.$1') : null,
      cloudinary: {
        author: user.name?.trim() || user.login,
        image_source: 'inaturalist',
        image_url: `https://www.inaturalist.org/photos/${photo.id}`,
        asset_type: 'photo',
        life_stage: stage === 'egg' ? null : stage,
        life_stages_descriptor: sex,
        // Option ids of the Cloudinary "License" field: the iNaturalist code with underscores.
        license: photo.license_code
          ? LICENCES[photo.license_code]
            ? photo.license_code.replace(/-/g, '_')
            : null
          : 'all_rights_reserved',
        permission_status: licence.status,
      },
    };
  });

  return {
    observation: `https://www.inaturalist.org/observations/${observation.id}`,
    taxon: { scientificName: taxon.name ?? null, commonName: taxon.preferred_common_name ?? null, rank: taxon.rank ?? null },
    qualityGrade: observation.quality_grade,
    place: observation.place_guess ?? null,
    observedOn: observation.observed_on ?? null,
    observer: { login: user.login, name: user.name?.trim() || null },
    warnings,
    photos,
  };
}

function print(result) {
  const { taxon } = result;
  console.log(`${result.observation}`);
  console.log(
    `  ${taxon.scientificName}${taxon.commonName ? ` (${taxon.commonName})` : ''}, ${taxon.rank}; ${result.qualityGrade} grade`
  );
  console.log(`  ${result.place ?? 'place not given'}; observed ${result.observedOn ?? 'date not given'}`);
  for (const warning of result.warnings) console.log(`  ! ${warning}`);

  for (const photo of result.photos) {
    const c = photo.cloudinary;
    console.log('');
    console.log(`  Photo ${photo.position} of ${result.photoCount}: ${photo.width ?? '?'} x ${photo.height ?? '?'} px`);
    console.log(`    licence            ${photo.licence}. ${photo.terms}`);
    console.log(`    attribution        ${photo.attribution}`);
    console.log(`    file               ${photo.file}`);
    console.log('    Cloudinary fields');
    for (const [field, value] of Object.entries(c)) {
      console.log(`      ${field.padEnd(24)}${value ?? '(leave empty)'}`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const id = options.target ? observationId(options.target) : null;
  if (!id) {
    fail('Usage: npm run photo:inat -- <iNaturalist observation link or id> [--photo N] [--expect "Scientific name"] [--json]');
  }

  const response = await fetch(`${API}/observations/${id}`, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) fail(`iNaturalist returned ${response.status} for observation ${id}.`);
  const observation = (await response.json()).results?.[0];
  if (!observation) fail(`iNaturalist has no observation ${id}.`);

  const result = describe(observation, options.expect);
  result.photoCount = result.photos.length;
  if (result.photoCount === 0) fail(`Observation ${id} has no photos.`);
  if (options.photo !== null) {
    result.photos = result.photos.filter((p) => p.position === options.photo);
    if (result.photos.length === 0) fail(`Observation ${id} has ${result.photoCount} photo(s); there is no photo ${options.photo}.`);
  }

  if (options.json) console.log(JSON.stringify(result, null, 2));
  else print(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
