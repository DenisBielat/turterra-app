/**
 * Species tracker: types and the rules for what counts as "entered".
 *
 * Rows come from the `admin_species_progress` database view
 * (supabase/migrations/019_create_species_checklist.sql), which
 * counts what exists in each species table. The rules that turn those counts
 * into complete / partial / missing live here, in one place.
 */

export type TrackingStatus = 'published' | 'draft' | 'skipped' | 'not_started';

/** One row of the admin_species_progress view. */
export interface SpeciesProgressRow {
  checklist_id: number | null;
  scientific_name: string | null;
  taxon_rank: 'species' | 'subspecies' | null;
  parent_species: string | null;
  genus: string | null;
  family: string | null;
  family_common_name: string | null;
  checklist_common_name: string | null;
  conservation_status: string | null;
  cites_appendix: string | null;
  continents: string[] | null;
  source: string | null;
  skip_reason: string | null;
  notes: string | null;

  species_id: number | null;
  slug: string | null;
  species_common_name: string | null;
  profile_scientific_name: string | null;
  profile_status: 'draft' | 'published' | null;
  profile_created_at: string | null;
  limited_information: boolean | null;
  tracking_status: TrackingStatus;

  has_avatar: boolean | null;
  text_sections_filled: number;
  measurements_filled: number;
  conservation_rows: number;
  population_rows: number;
  habitat_tags: number;
  ecology_tags: number;
  habitat_type_tags: number;
  region_tags: number;
  threat_tags: number;
  behavior_tags: number;
  reference_count: number;
  physical_feature_variants: number;
  has_range_map: boolean;
  has_published_care_guide: boolean;
}

export type SectionState = 'complete' | 'partial' | 'missing';

export interface SectionProgress {
  key: string;
  label: string;
  state: SectionState;
  /** Short count shown next to the label, e.g. "7/11". */
  detail?: string;
  /** Longer explanation for the tooltip. */
  hint: string;
}

export const TEXT_SECTION_TOTAL = 11;
export const MEASUREMENT_TOTAL = 8;

function present(count: number): SectionState {
  return count > 0 ? 'complete' : 'missing';
}

/**
 * The sections of a species profile and how far along each one is.
 * Only meaningful for rows that have a profile (species_id is set).
 */
export function getSectionProgress(row: SpeciesProgressRow): SectionProgress[] {
  const habitatGroups = [row.habitat_tags, row.ecology_tags, row.habitat_type_tags];
  const habitatGroupsFilled = habitatGroups.filter((n) => n > 0).length;

  return [
    {
      key: 'text',
      label: 'Text',
      state:
        row.text_sections_filled >= TEXT_SECTION_TOTAL
          ? 'complete'
          : row.text_sections_filled > 0
            ? 'partial'
            : 'missing',
      detail: `${row.text_sections_filled}/${TEXT_SECTION_TOTAL}`,
      hint: `${row.text_sections_filled} of ${TEXT_SECTION_TOTAL} written sections (at a glance, identification, distribution, habitat, diet, hibernation, nesting, unique traits, conservation, predators, threats)`,
    },
    {
      key: 'measurements',
      label: 'Measurements',
      state: present(row.measurements_filled),
      detail: `${row.measurements_filled}/${MEASUREMENT_TOTAL}`,
      hint: `${row.measurements_filled} of ${MEASUREMENT_TOTAL} measurement fields (weight, female and male length, larger sex, wild and captive lifespan ranges)`,
    },
    {
      key: 'features',
      label: 'Features',
      state: present(row.physical_feature_variants),
      detail: String(row.physical_feature_variants),
      hint: `${row.physical_feature_variants} physical-feature record(s) (adult male, adult female, juvenile, hatchling...)`,
    },
    {
      key: 'status',
      label: 'Status',
      state: present(row.conservation_rows),
      hint: `${row.conservation_rows} conservation status record(s)`,
    },
    {
      key: 'population',
      label: 'Population',
      state: present(row.population_rows),
      hint: `${row.population_rows} population estimate record(s)`,
    },
    {
      key: 'habitat',
      label: 'Habitat',
      state: habitatGroupsFilled === 3 ? 'complete' : habitatGroupsFilled > 0 ? 'partial' : 'missing',
      hint: `${row.habitat_tags} habitat, ${row.ecology_tags} ecology and ${row.habitat_type_tags} habitat-type tag(s)`,
    },
    {
      key: 'regions',
      label: 'Regions',
      state: present(row.region_tags),
      hint: `${row.region_tags} region tag(s)`,
    },
    {
      key: 'threats',
      label: 'Threats',
      state: present(row.threat_tags),
      hint: `${row.threat_tags} threat tag(s)`,
    },
    {
      key: 'map',
      label: 'Range map',
      state: row.has_range_map ? 'complete' : 'missing',
      hint: row.has_range_map ? 'Range map imported' : 'No range map imported',
    },
    {
      key: 'references',
      label: 'References',
      state: present(row.reference_count),
      detail: String(row.reference_count),
      hint: `${row.reference_count} reference(s)`,
    },
    {
      key: 'avatar',
      label: 'Avatar',
      state: row.has_avatar ? 'complete' : 'missing',
      hint: row.has_avatar ? 'Circle and full avatar images set' : 'Avatar images not set',
    },
  ];
}

export function countCompleteSections(sections: SectionProgress[]): number {
  return sections.filter((s) => s.state === 'complete').length;
}

export const TRACKING_STATUS_LABEL: Record<TrackingStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  skipped: 'Skipped',
  not_started: 'Not started',
};

/** Display order: work in progress first, then what is live, then the backlog. */
export const TRACKING_STATUS_ORDER: TrackingStatus[] = ['draft', 'published', 'skipped', 'not_started'];
