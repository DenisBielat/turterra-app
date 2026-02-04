import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = {
  title: "Settings | Turterra",
  description: "Manage your Turterra account settings",
};

/**
 * Settings Page
 *
 * Protected route for authenticated users to manage their account.
 * Includes profile settings, account settings, and danger zone.
 */
export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // Get linked identity providers (email, google, etc.)
  const identities = user.identities || [];
  const linkedProviders = identities.map((i) => i.provider);

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-950 font-heading mb-8">
          Settings
        </h1>
        <SettingsForm
          profile={profile}
          userEmail={user.email || ""}
          linkedProviders={linkedProviders}
        />
      </div>
    </div>
  );
}
