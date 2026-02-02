import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export const metadata = {
  title: "Complete Your Profile | Turterra",
  description: "Choose your username and set up your Turterra profile",
};

/**
 * Onboarding Page
 *
 * This page is shown to new users after they confirm their email.
 * They must choose a username before they can use the rest of the site.
 *
 * FLOW:
 * 1. User signs up and confirms email
 * 2. Auth callback redirects them here
 * 3. They pick a username (and optionally a display name)
 * 4. Profile is created and they're sent to their profile page
 *
 * PROTECTION:
 * - Redirects to /login if not authenticated
 * - Redirects to profile if user already has one
 */
export default async function OnboardingPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in - send to login page
    redirect("/login");
  }

  // Check if user already has a profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile) {
    // Already has profile - send to their profile page
    redirect(`/user/${profile.username}`);
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
          Welcome to Turterra!
        </h1>
        <p className="text-gray-600">
          Let&apos;s set up your profile to get started
        </p>
      </div>

      <OnboardingForm userId={user.id} userEmail={user.email || ""} />
    </>
  );
}
