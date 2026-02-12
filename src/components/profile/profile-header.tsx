"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types/database";
import { UserAvatar } from "@/components/user-avatar";
import { AvatarUpload } from "@/components/profile/avatar-upload";

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  turtleCount?: number;
  postCount?: number;
}

/**
 * Profile Header Component
 *
 * Displays the user's avatar, name, username, and stats.
 * Shows an avatar upload button if viewing own profile.
 */
export function ProfileHeader({ profile, isOwnProfile, turtleCount = 0, postCount = 0 }: ProfileHeaderProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const displayName = profile.display_name || profile.username;

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          {isOwnProfile ? (
            <AvatarUpload
              userId={profile.id}
              currentAvatarUrl={avatarUrl}
              displayName={profile.display_name}
              username={profile.username}
              size="xl"
              onUploadComplete={(url) => {
                setAvatarUrl(url || null);
                router.refresh();
              }}
            />
          ) : (
            <UserAvatar
              avatarUrl={profile.avatar_url}
              displayName={profile.display_name}
              username={profile.username}
              size="xl"
            />
          )}
        </div>

        {/* Name and Stats */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-green-950 font-heading">
            {displayName}
          </h1>
          <p className="text-gray-500 mb-4">@{profile.username}</p>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-green-700">{postCount}</p>
              <p className="text-sm text-gray-500">Forum Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-700">0</p>
              <p className="text-sm text-gray-500">IDs Made</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-700">{turtleCount}</p>
              <p className="text-sm text-gray-500">Pet Turtles</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
