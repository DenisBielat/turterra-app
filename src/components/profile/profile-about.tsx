"use client";

import { Profile } from "@/types/database";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileAboutProps {
  profile: Profile;
  isOwnProfile: boolean;
}

/**
 * Profile About Section
 *
 * Displays bio and location with inline editing for profile owners.
 * Uses optimistic updates for a smooth editing experience.
 */
export function ProfileAbout({ profile, isOwnProfile }: ProfileAboutProps) {
  const router = useRouter();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [bio, setBio] = useState(profile.bio || "");
  const [location, setLocation] = useState(profile.location || "");
  const [saving, setSaving] = useState(false);

  const saveBio = async () => {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ bio: bio.trim() || null })
      .eq("id", profile.id);

    if (error) {
      console.error("Failed to save bio:", error);
      setBio(profile.bio || "");
    }

    setSaving(false);
    setIsEditingBio(false);
    router.refresh();
  };

  const saveLocation = async () => {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ location: location.trim() || null })
      .eq("id", profile.id);

    if (error) {
      console.error("Failed to save location:", error);
      setLocation(profile.location || "");
    }

    setSaving(false);
    setIsEditingLocation(false);
    router.refresh();
  };

  const cancelBioEdit = () => {
    setBio(profile.bio || "");
    setIsEditingBio(false);
  };

  const cancelLocationEdit = () => {
    setLocation(profile.location || "");
    setIsEditingLocation(false);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-green-950 font-heading mb-6">
        About
      </h2>

      {/* Bio */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-500">Bio</label>
          {isOwnProfile && !isEditingBio && (
            <button
              onClick={() => setIsEditingBio(true)}
              className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 transition-colors"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit
            </button>
          )}
        </div>

        {isEditingBio ? (
          <div className="space-y-3">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none"
              placeholder="Tell others about yourself..."
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{bio.length}/500</span>
              <div className="flex gap-2">
                <button
                  onClick={cancelBioEdit}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBio}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-green-950">
            {profile.bio || (
              <span className="text-gray-400 italic">
                {isOwnProfile
                  ? "Add a bio to tell others about yourself"
                  : "No bio yet"}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-500">Location</label>
          {isOwnProfile && !isEditingLocation && (
            <button
              onClick={() => setIsEditingLocation(true)}
              className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 transition-colors"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit
            </button>
          )}
        </div>

        {isEditingLocation ? (
          <div className="space-y-3">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              placeholder="City, State/Country"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelLocationEdit}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveLocation}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-green-950 flex items-center gap-2">
            {profile.location ? (
              <>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {profile.location}
              </>
            ) : (
              <span className="text-gray-400 italic">
                {isOwnProfile ? "Add your location" : "No location set"}
              </span>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
