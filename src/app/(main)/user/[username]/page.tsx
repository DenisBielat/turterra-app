import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { UserTurtles } from "@/components/profile/user-turtles";
import { UserPosts } from "@/components/profile/user-posts";
import { getUserPosts, getUserDrafts, getUserPostCount, getUserSavedPosts } from "@/lib/queries/community";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

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

  // Fetch user's posts and post count
  const [posts, postCount] = await Promise.all([
    getUserPosts(profile.id),
    getUserPostCount(profile.id),
  ]);

  // Only fetch drafts and saved posts for own profile
  const [drafts, savedRows] = await Promise.all([
    isOwnProfile ? getUserDrafts(profile.id) : Promise.resolve([]),
    isOwnProfile ? getUserSavedPosts(profile.id) : Promise.resolve([]),
  ]);

  // Normalize post data for the UserPosts component
  const normalizedPosts = (posts ?? []).map((p) => ({
    id: p.id as number,
    title: p.title as string,
    created_at: p.created_at as string,
    is_draft: false as const,
    score: p.score as number,
    comment_count: p.comment_count as number,
    channel: p.channel as unknown as { slug: string; name: string } | null,
  }));

  const normalizedDrafts = (drafts ?? []).map((p) => ({
    id: p.id as number,
    title: p.title as string,
    created_at: p.created_at as string,
    is_draft: true as const,
    channel: p.channel as unknown as { slug: string; name: string } | null,
  }));

  const normalizedSaved = (savedRows ?? [])
    .map((row) => {
      const p = row.post as unknown as {
        id: number;
        title: string;
        score: number;
        comment_count: number;
        created_at: string;
        channel: { slug: string; name: string } | null;
      };
      if (!p) return null;
      return {
        id: p.id,
        title: p.title,
        created_at: p.created_at,
        score: p.score,
        comment_count: p.comment_count,
        channel: p.channel,
      };
    })
    .filter(Boolean) as Array<{
      id: number;
      title: string;
      created_at: string;
      score: number;
      comment_count: number;
      channel: { slug: string; name: string } | null;
    }>;

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
              postCount={postCount}
            />
            <ProfileAbout profile={profile} isOwnProfile={isOwnProfile} />
            <UserPosts
              posts={normalizedPosts}
              drafts={normalizedDrafts}
              savedPosts={normalizedSaved}
              isOwnProfile={isOwnProfile}
            />
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
