import { Profile } from "@/types/database";
import Link from "next/link";

interface ProfileSidebarProps {
  profile: Profile;
  isOwnProfile: boolean;
}

/**
 * Profile Sidebar Component
 *
 * Displays member info, badges, and quick links (for own profile).
 * Badges are currently only "Verified Member" but more can be added.
 */
export function ProfileSidebar({ profile, isOwnProfile }: ProfileSidebarProps) {
  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Member Info */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-green-950 font-heading mb-4">
          Member Info
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Joined</p>
            <p className="font-medium text-green-950">{joinedDate}</p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-green-950 font-heading mb-4">
          Badges
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.is_verified && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Verified Member
            </span>
          )}
          {/* Placeholder badges - these would come from database in real implementation */}
          {!profile.is_verified && (
            <p className="text-gray-400 text-sm italic">No badges yet</p>
          )}
        </div>
      </section>

      {/* Quick Links (only for own profile) */}
      {isOwnProfile && (
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-green-950 font-heading mb-4">
            Quick Links
          </h3>
          <nav className="space-y-3">
            <Link
              href="/settings"
              className="block text-green-950 hover:text-green-700 transition-colors"
            >
              Account Settings
            </Link>
            <span className="block text-gray-400 cursor-not-allowed">
              Privacy Settings
              <span className="ml-2 text-xs">(coming soon)</span>
            </span>
            <a
              href="#my-posts"
              className="block text-green-950 hover:text-green-700 transition-colors"
            >
              My Forum Posts
            </a>
            <Link
              href="/community/saved"
              className="block text-green-950 hover:text-green-700 transition-colors"
            >
              Saved Posts
            </Link>
            <span className="block text-gray-400 cursor-not-allowed">
              My Identifications
              <span className="ml-2 text-xs">(coming soon)</span>
            </span>
          </nav>
        </section>
      )}
    </div>
  );
}
