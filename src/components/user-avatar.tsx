"use client";

import Image from "next/image";

interface UserAvatarProps {
  avatarUrl: string | null;
  displayName: string | null;
  username: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-2xl",
  xl: "w-28 h-28 text-5xl",
};

/**
 * User Avatar Component
 *
 * Displays the user's profile image if available, otherwise shows
 * the first letter of their display name or username (Google-style).
 */
export function UserAvatar({
  avatarUrl,
  displayName,
  username,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const initial = (displayName || username).charAt(0).toUpperCase();
  const sizeClass = sizeMap[size];

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName || username}
        width={64}
        height={64}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-green-600 text-white font-bold flex items-center justify-center flex-shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
}
