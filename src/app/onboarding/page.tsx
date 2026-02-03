import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { TurtleShowcase } from "@/components/onboarding/turtle-showcase";
import Image from "next/image";

export const metadata = {
  title: "Welcome to Turterra | Complete Your Profile",
  description: "Set up your Turterra profile and join the turtle community",
};

/**
 * Onboarding Page
 *
 * Split-screen layout with:
 * - Logo at top-left (on warm background)
 * - Left: Turtle image showcase in a rounded card
 * - Right: Multi-step onboarding wizard
 */
export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile) {
    redirect(`/user/${profile.username}`);
  }

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10">
      {/* Logo */}
      <div className="mb-6 lg:mb-8">
        <Image
          src="/images/turterra-text-logo-dark.png"
          alt="Turterra"
          width={160}
          height={32}
          className="h-8 w-auto"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left side - Turtle Showcase Card (hidden on mobile) */}
        <div className="hidden lg:block lg:w-[42%]">
          <div className="h-full rounded-2xl overflow-hidden">
            <TurtleShowcase />
          </div>
        </div>

        {/* Right side - Onboarding Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <OnboardingWizard userId={user.id} userEmail={user.email || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
