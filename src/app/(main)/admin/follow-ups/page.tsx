import FollowUps from "@/components/admin/FollowUps";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/admin/auth";
import type { FollowUp, TaxonOption } from "@/lib/admin/followups";

export const metadata = {
  title: "Follow-ups | Turterra admin",
  robots: { index: false, follow: false },
};

/**
 * Admin: follow-ups
 *
 * Sources worth chasing for more detail (a book, a paper, an author to
 * contact), filed under the species, subspecies or genus they cover.
 *
 * Only users with profiles.role = 'admin' can open it. The species_followups
 * table has the same restriction in the database, so reading and editing here
 * needs no service role key.
 *
 * /admin/follow-ups?taxon=Terrapene carolina shows what applies to one taxon.
 */
export default async function AdminFollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ taxon?: string | string[] }>;
}) {
  const supabase = await requireAdminPage();
  const { taxon } = await searchParams;
  const initialTaxon = (Array.isArray(taxon) ? taxon[0] : taxon)?.trim() || undefined;

  const [followUps, taxa] = await Promise.all([
    supabase.from("species_followups").select("*").order("created_at", { ascending: false }),
    supabase
      .from("admin_species_progress")
      .select("scientific_name, taxon_rank, parent_species, genus, checklist_common_name, species_common_name, slug")
      .order("scientific_name", { ascending: true }),
  ]);

  const error = followUps.error ?? taxa.error;
  if (error) {
    return (
      <div className="min-h-screen bg-warm">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-green-950 font-heading mb-4">Follow-ups</h1>
          <AdminNav current="/admin/follow-ups" />
          <div className="rounded-xl border border-orange-300 bg-orange-50 p-5 text-sm text-gray-800">
            <p className="font-semibold mb-2">Follow-ups could not be loaded.</p>
            <p className="mb-3">
              If they have not been set up in this database yet, run this file (see{" "}
              <code>supabase/migrations/README.md</code>):
            </p>
            <p className="font-mono text-xs">supabase/migrations/024_species_followups.sql</p>
            <p className="mt-3 text-gray-600">Database message: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const options: TaxonOption[] = (taxa.data ?? [])
    .filter((row) => row.scientific_name)
    .map((row) => ({
      scientificName: row.scientific_name as string,
      rank: row.taxon_rank,
      parentSpecies: row.parent_species,
      genus: row.genus,
      commonName: row.species_common_name || row.checklist_common_name,
      slug: row.slug,
    }));

  return (
    <FollowUps followUps={(followUps.data ?? []) as FollowUp[]} taxa={options} initialTaxon={initialTaxon} />
  );
}
