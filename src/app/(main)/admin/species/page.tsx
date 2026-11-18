import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SpeciesTracker from "@/components/admin/SpeciesTracker";
import type { SpeciesProgressRow } from "@/lib/admin/species-progress";

export const metadata = {
  title: "Species tracker | Turterra admin",
  robots: { index: false, follow: false },
};

/**
 * Admin: species tracker
 *
 * Shows every taxon on the reference checklist, whether it has a Turterra
 * profile yet, and which sections of that profile have been entered.
 *
 * Only users with profiles.role = 'admin' can open it. The data comes from the
 * admin_species_progress view, which the database also restricts to admins,
 * so this page never needs the service role key.
 */
export default async function AdminSpeciesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    notFound();
  }

  const { data, error } = await supabase
    .from("admin_species_progress")
    .select("*")
    .order("scientific_name", { ascending: true });

  if (error) {
    return (
      <div className="min-h-screen bg-warm">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-green-950 font-heading mb-4">
            Species tracker
          </h1>
          <div className="rounded-xl border border-orange-300 bg-orange-50 p-5 text-sm text-gray-800">
            <p className="font-semibold mb-2">The tracker could not be loaded.</p>
            <p className="mb-3">
              If the tracker has not been set up in this database yet, run these
              files in order (see <code>supabase/migrations/README.md</code>):
            </p>
            <ol className="list-decimal list-inside space-y-1 font-mono text-xs">
              <li>supabase/migrations/20261118_001_admin_helper_and_lock_profile_role.sql</li>
              <li>supabase/migrations/20261118_002_add_species_status.sql</li>
              <li>supabase/migrations/20261118_003_create_species_checklist.sql</li>
              <li>supabase/content/species_checklist_seed.sql</li>
            </ol>
            <p className="mt-3 text-gray-600">
              Database message: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <SpeciesTracker rows={(data ?? []) as SpeciesProgressRow[]} />;
}
