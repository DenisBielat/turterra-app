import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

/**
 * User Profile Page
 *
 * Displays a user's public profile with:
 * - Avatar, name, username, stats
 * - Bio and location (editable if own profile)
 * - Sidebar with member info, badges, quick links
 *
 * Route: /user/[username]
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch the profile by username
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Check if this is the current user viewing their own profile
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-amber-50/50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1 space-y-6">
            <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
            <ProfileAbout profile={profile} isOwnProfile={isOwnProfile} />

            {/* My Turtles Section - Placeholder for future */}
            <section className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-950 font-heading">
                  My Turtles
                </h2>
                {isOwnProfile && (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full opacity-50 cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Turtle
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-center py-8">
                Turtle profiles coming soon!
              </p>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="lg:w-80">
            <ProfileSidebar profile={profile} isOwnProfile={isOwnProfile} />
          </aside>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio")
    .eq("username", username)
    .single();

  if (!profile) {
    return { title: "User Not Found | Turterra" };
  }

  const name = profile.display_name || `@${profile.username}`;

  return {
    title: `${name} | Turterra`,
    description: profile.bio || `${name}'s profile on Turterra`,
  };
}
