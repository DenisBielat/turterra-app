/**
 * Species follow-ups: sources worth chasing for more detail (a book, a paper
 * behind a paywall, an author to contact) and gaps in the data.
 *
 * Rows live in `species_followups`
 * (supabase/migrations/024_species_followups.sql) and are admin only.
 */

export type FollowUpKind = 'book' | 'paper' | 'contact' | 'data' | 'other';
export type FollowUpStatus = 'open' | 'obtained' | 'done' | 'dropped';

/** One row of species_followups. */
export interface FollowUp {
  id: number;
  /** Scientific names it applies to. A species covers its subspecies; a bare genus covers the genus. */
  taxa: string[];
  kind: FollowUpKind;
  title: string;
  would_fill: string | null;
  url: string | null;
  status: FollowUpStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** What the add and edit forms send. */
export interface FollowUpInput {
  taxa: string[];
  kind: FollowUpKind;
  title: string;
  would_fill: string;
  url: string;
  notes: string;
}

/** A name a follow-up can be filed under, from the species tracker view. */
export interface TaxonOption {
  scientificName: string;
  rank: 'species' | 'subspecies' | null;
  parentSpecies: string | null;
  genus: string | null;
  commonName: string | null;
  slug: string | null;
}

export const FOLLOW_UP_KINDS: FollowUpKind[] = ['book', 'paper', 'contact', 'data', 'other'];
export const FOLLOW_UP_STATUSES: FollowUpStatus[] = ['open', 'obtained', 'done', 'dropped'];

export const FOLLOW_UP_KIND_LABEL: Record<FollowUpKind, string> = {
  book: 'Book',
  paper: 'Paper',
  contact: 'Person to contact',
  data: 'Missing data',
  other: 'Other',
};

export const FOLLOW_UP_STATUS_LABEL: Record<FollowUpStatus, string> = {
  open: 'To get',
  obtained: 'In hand',
  done: 'Used',
  dropped: 'Dropped',
};

export const FOLLOW_UP_STATUS_HINT: Record<FollowUpStatus, string> = {
  open: 'Not obtained yet',
  obtained: 'Obtained, not yet worked into the profile',
  done: 'Worked into the profile',
  dropped: 'Decided against',
};

/** Still needs attention: counted on the species tracker. */
export function isPending(status: FollowUpStatus): boolean {
  return status === 'open' || status === 'obtained';
}

/**
 * Whether a follow-up filed under `taxa` applies to a taxon: it names the
 * taxon itself, the species it is a subspecies of, or its genus. The same
 * rule as the pending_followups count in the admin_species_progress view.
 */
export function followUpCoversTaxon(
  taxa: string[],
  taxon: Pick<TaxonOption, 'scientificName' | 'parentSpecies' | 'genus'>
): boolean {
  return (
    taxa.includes(taxon.scientificName) ||
    (taxon.parentSpecies !== null && taxa.includes(taxon.parentSpecies)) ||
    (taxon.genus !== null && taxa.includes(taxon.genus))
  );
}

/** A genus, binomial or trinomial: "Terrapene", "Terrapene carolina", "Terrapene carolina bauri". */
export const TAXON_NAME_PATTERN = /^[A-Z][a-z]+( [a-z-]+){0,2}$/;

export const FOLLOW_UP_LIMITS = { title: 600, text: 2000, url: 600, taxa: 20 } as const;
