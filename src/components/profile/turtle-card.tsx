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

export function TurtleCard({ turtle, isOwnProfile, onEdit }: TurtleCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const sexLabel =
    turtle.sex === "male"
      ? "Male"
      : turtle.sex === "female"
        ? "Female"
        : turtle.sex === "unknown"
          ? "Unknown sex"
          : null;

  return (
    <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden group">
      {/* Photo or placeholder */}
      <div className="relative aspect-square bg-green-50">
        {turtle.photo_url ? (
          <img
            src={turtle.photo_url}
            alt={turtle.name}
            className="w-full h-full object-cover"
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
        <h3 className="font-semibold text-green-950 truncate">{turtle.name}</h3>
        {turtle.species_common_name && (
          <p className="text-sm text-gray-500 truncate">
            {turtle.species_common_name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {sexLabel && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              {sexLabel}
            </span>
          )}
        </div>
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
