import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { UserTurtles } from "@/components/profile/user-turtles";

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

  // Fetch the user's turtles
  const { data: turtles } = await supabase
    .from("user_turtles")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1 space-y-6">
            <ProfileHeader
              profile={profile}
              isOwnProfile={isOwnProfile}
              turtleCount={turtles?.length ?? 0}
            />
            <ProfileAbout profile={profile} isOwnProfile={isOwnProfile} />
            <UserTurtles
              turtles={turtles || []}
              userId={profile.id}
              isOwnProfile={isOwnProfile}
            />
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
