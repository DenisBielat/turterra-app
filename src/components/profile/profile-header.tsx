import { Profile } from "@/types/database";
import { UserAvatar } from "@/components/user-avatar";

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
}

/**
 * Profile Header Component
 *
 * Displays the user's avatar, name, username, and stats.
 * Shows an edit button on the avatar if viewing own profile.
 */
export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const displayName = profile.display_name || profile.username;

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <UserAvatar
            avatarUrl={profile.avatar_url}
            displayName={profile.display_name}
            username={profile.username}
            size="xl"
          />
          {isOwnProfile && (
            <button
              disabled
              title="Avatar upload coming soon"
              className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors opacity-50 cursor-not-allowed"
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
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
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
              <p className="text-xl font-bold text-green-700">0</p>
              <p className="text-sm text-gray-500">Forum Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-700">0</p>
              <p className="text-sm text-gray-500">IDs Made</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-700">0</p>
              <p className="text-sm text-gray-500">Pet Turtles</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
