"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserTurtle } from "@/types/database";

interface TurtleCardProps {
  turtle: UserTurtle;
  isOwnProfile: boolean;
  onEdit: () => void;
}

// Parse date and determine precision
function parseDateInfo(dateStr: string | null): {
  year: number | null;
  month: number | null;
  day: number | null;
  precision: "year" | "month" | "day" | null;
} {
  if (!dateStr) return { year: null, month: null, day: null, precision: null };

  const parts = dateStr.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);

  // Determine precision based on default values
  if (month === 1 && day === 1) {
    return { year, month: null, day: null, precision: "year" };
  }
  if (day === 1) {
    return { year, month, day: null, precision: "month" };
  }
  return { year, month, day, precision: "day" };
}

function calculateAge(dateStr: string | null): string | null {
  const dateInfo = parseDateInfo(dateStr);
  if (!dateInfo.year) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let years = currentYear - dateInfo.year;

  // Adjust based on precision
  if (dateInfo.precision === "year") {
    // Just show years
    if (years === 0) return "< 1 year";
    return years === 1 ? "1 year" : `${years} years`;
  }

  if (dateInfo.precision === "month" || dateInfo.precision === "day") {
    // More precise calculation
    if (dateInfo.month && currentMonth < dateInfo.month) {
      years--;
    }
    if (years < 0) years = 0;
    if (years === 0) return "< 1 year";
    return years === 1 ? "1 year" : `${years} years`;
  }

  return null;
}

function isBirthday(dateStr: string | null): boolean {
  const dateInfo = parseDateInfo(dateStr);
  if (!dateInfo.month || !dateInfo.day) return false;

  const now = new Date();
  return now.getMonth() + 1 === dateInfo.month && now.getDate() === dateInfo.day;
}

// Male icon (Mars symbol)
function MaleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20 4v6h-2V7.41l-4.29 4.3A6 6 0 1 1 12 6c1.2 0 2.32.35 3.26.95L19.59 2.6 17 0h6v4a1 1 0 0 1-1 1h-2ZM9 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}

// Female icon (Venus symbol)
function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2a6 6 0 0 1 6 6c0 2.97-2.16 5.44-5 5.92V16h2v2h-2v2h-2v-2H9v-2h2v-2.08A6.002 6.002 0 0 1 12 2Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </svg>
  );
}

// Cake icon
function CakeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20" />
      <path d="M7 8v3" />
      <path d="M12 8v3" />
      <path d="M17 8v3" />
      <path d="M7 4h0.01" />
      <path d="M12 4h0.01" />
      <path d="M17 4h0.01" />
    </svg>
  );
}

export function TurtleCard({ turtle, isOwnProfile, onEdit }: TurtleCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    const supabase = createClient();

    // Delete the photo from storage if it exists
    if (turtle.photo_url) {
      const ext = turtle.photo_url.includes(".webp") ? "webp" : "jpg";
      const path = `${turtle.user_id}/${turtle.id}.${ext}`;
      await supabase.storage.from("user-turtle-photos").remove([path]);
    }

    const { error } = await supabase
      .from("user_turtles")
      .delete()
      .eq("id", turtle.id);

    if (error) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }

    router.refresh();
  };

  const age = calculateAge(turtle.date_acquired);
  const hasBirthday = isBirthday(turtle.date_acquired);

  return (
    <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden group shadow-sm">
      {/* Photo or placeholder */}
      <div className="relative aspect-square bg-green-50">
        {turtle.photo_url && !imageError ? (
          <img
            src={turtle.photo_url}
            alt={turtle.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}

        {/* Action buttons (own profile only) */}
        {isOwnProfile && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-green-700 hover:bg-white transition-colors shadow-sm"
              title="Edit"
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
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-red-600 hover:bg-white transition-colors shadow-sm"
              title="Delete"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-green-950 truncate">{turtle.name}</h3>
          {turtle.sex === "male" && (
            <MaleIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
          )}
          {turtle.sex === "female" && (
            <FemaleIcon className="w-4 h-4 text-pink-500 flex-shrink-0" />
          )}
        </div>
        {turtle.species_common_name && (
          <p className="text-sm text-gray-500 truncate">
            {turtle.species_common_name}
          </p>
        )}
        {age && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs text-gray-400">{age}</span>
            {hasBirthday && (
              <CakeIcon className="w-3.5 h-3.5 text-orange-400" />
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-xl z-10">
          <p className="text-sm font-medium text-green-950 mb-1">
            Remove {turtle.name}?
          </p>
          <p className="text-xs text-gray-500 mb-4 text-center">
            This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 disabled:opacity-50 transition-all"
            >
              {deleting ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
