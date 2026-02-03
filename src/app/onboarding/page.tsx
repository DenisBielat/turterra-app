import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { TurtleShowcase } from "@/components/onboarding/turtle-showcase";

export const metadata = {
  title: "Welcome to Turterra | Complete Your Profile",
  description: "Set up your Turterra profile and join the turtle community",
};

/**
 * Onboarding Page
 *
 * A beautiful split-screen onboarding experience featuring:
 * - Left side: Random turtle showcase with image and fun fact
 * - Right side: Multi-step profile setup wizard
 *
 * Protected route - redirects to login if not authenticated,
 * redirects to profile if user already has one.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already has a profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile) {
    redirect(`/user/${profile.username}`);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Turtle Showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative">
        <TurtleShowcase />
      </div>

      {/* Right side - Onboarding Form */}
      <div className="flex-1 flex flex-col bg-amber-50/95 lg:rounded-l-3xl lg:-ml-6 relative z-10">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg">
            <OnboardingWizard userId={user.id} userEmail={user.email || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
