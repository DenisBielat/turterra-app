"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/actions/auth";
import { AvatarUpload } from "@/components/profile/avatar-upload";

interface SettingsFormProps {
  profile: Profile;
  userEmail: string;
}

export function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const router = useRouter();

  // Profile fields
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [location, setLocation] = useState(profile.location || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{
    type: "error";
    text: string;
  } | null>(null);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
      })
      .eq("id", profile.id);

    if (error) {
      setProfileMessage({ type: "error", text: error.message });
    } else {
      setProfileMessage({ type: "success", text: "Profile updated." });
      router.refresh();
    }

    setProfileSaving(false);
  };

  const handlePasswordChange = async () => {
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPasswordSaving(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({ type: "success", text: "Password updated." });
      setNewPassword("");
      setConfirmPassword("");
    }

    setPasswordSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== profile.username) return;

    setDeleting(true);
    setDeleteMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profile.id);

    if (error) {
      setDeleteMessage({
        type: "error",
        text: "Failed to delete account. Please contact support.",
      });
      setDeleting(false);
      return;
    }

    signOut();
  };

  const profileHasChanges =
    (displayName.trim() || null) !== (profile.display_name || null) ||
    (bio.trim() || null) !== (profile.bio || null) ||
    (location.trim() || null) !== (profile.location || null);

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Settings */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-green-950 font-heading mb-6">
          Profile
        </h2>

        <div className="space-y-6">
          {/* Avatar + Username */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <AvatarUpload
              userId={profile.id}
              currentAvatarUrl={profile.avatar_url}
              displayName={profile.display_name}
              username={profile.username}
              size="lg"
              onUploadComplete={() => router.refresh()}
            />
            <div>
              <p className="font-semibold text-green-950">
                @{profile.username}
              </p>
              <p className="text-sm text-gray-500">
                Username cannot be changed
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-green-950"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-green-950"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-400 text-right">
              {bio.length}/500 characters
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-green-950"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Save Button + Message */}
          <div className="flex items-center justify-between pt-2">
            {profileMessage && (
              <p
                className={`text-sm ${
                  profileMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {profileMessage.text}
              </p>
            )}
            <div className="ml-auto">
              <button
                onClick={handleProfileSave}
                disabled={profileSaving || !profileHasChanges}
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Account Settings */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-green-950 font-heading mb-6">
          Account
        </h2>

        <div className="space-y-6">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-green-950">
              Email
            </label>
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500">
              {userEmail}
            </div>
            <p className="text-xs text-gray-400">
              Contact support to change your email address
            </p>
          </div>

          {/* Change Password */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-base font-semibold text-green-950 mb-4">
              Change Password
            </h3>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-green-950"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-green-950"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordSaving || !newPassword || !confirmPassword}
                  className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
                {passwordMessage && (
                  <p
                    className={`text-sm ${
                      passwordMessage.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordMessage.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-xl font-bold text-red-600 font-heading mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          These actions are permanent and cannot be undone.
        </p>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Type <span className="font-mono font-semibold">{profile.username}</span> to
              confirm account deletion.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={profile.username}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== profile.username || deleting}
              className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </button>
            {deleteMessage && (
              <p className="text-sm text-red-600">{deleteMessage.text}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
