"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserTurtle } from "@/types/database";
import { SpeciesSearch } from "./species-search";
import { compressImage } from "@/lib/avatar";

interface TurtleFormProps {
  userId: string;
  turtle?: UserTurtle;
  onClose: () => void;
}

export function TurtleForm({ userId, turtle, onClose }: TurtleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(turtle?.name || "");
  const [species, setSpecies] = useState({
    species_id: turtle?.species_id ?? null,
    species_common_name: turtle?.species_common_name || "",
    species_scientific_name: turtle?.species_scientific_name || "",
  });
  const [sex, setSex] = useState<"male" | "female" | "unknown" | "">(
    turtle?.sex || ""
  );
  const [bio, setBio] = useState(turtle?.bio || "");
  const [dateAcquired, setDateAcquired] = useState(
    turtle?.date_acquired || ""
  );
  const [photoUrl, setPhotoUrl] = useState(turtle?.photo_url || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!turtle;

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  // Clean up photo preview URL
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPhoto = async (turtleId: string): Promise<string | null> => {
    if (!photoFile) return photoUrl || null;

    const compressed = await compressImage(photoFile);
    const ext = compressed.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${turtleId}.${ext}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("turtle-photos")
      .upload(path, compressed, { upsert: true, cacheControl: "3600" });

    if (uploadError) throw new Error("Failed to upload photo");

    const {
      data: { publicUrl },
    } = supabase.storage.from("turtle-photos").getPublicUrl(path);

    return `${publicUrl}?v=${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please give your turtle a name.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      if (isEditing) {
        // Upload photo first if changed
        let finalPhotoUrl = photoUrl;
        if (photoFile) {
          finalPhotoUrl = (await uploadPhoto(turtle.id)) || "";
        }

        const { error: updateError } = await supabase
          .from("user_turtles")
          .update({
            name: name.trim(),
            species_id: species.species_id,
            species_common_name: species.species_common_name || null,
            species_scientific_name: species.species_scientific_name || null,
            bio: bio.trim() || null,
            photo_url: finalPhotoUrl || null,
            sex: (sex as "male" | "female" | "unknown") || null,
            date_acquired: dateAcquired || null,
          })
          .eq("id", turtle.id);

        if (updateError) throw updateError;
      } else {
        // Insert new turtle, then upload photo
        const { data: newTurtle, error: insertError } = await supabase
          .from("user_turtles")
          .insert({
            user_id: userId,
            name: name.trim(),
            species_id: species.species_id,
            species_common_name: species.species_common_name || null,
            species_scientific_name: species.species_scientific_name || null,
            bio: bio.trim() || null,
            sex: (sex as "male" | "female" | "unknown") || null,
            date_acquired: dateAcquired || null,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        // Upload photo if selected
        if (photoFile && newTurtle) {
          const url = await uploadPhoto(newTurtle.id);
          if (url) {
            await supabase
              .from("user_turtles")
              .update({ photo_url: url })
              .eq("id", newTurtle.id);
          }
        }
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  };

  const displayPhoto = photoPreview || photoUrl;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-green-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-green-950 font-heading mb-6">
            {isEditing ? "Edit Turtle" : "Add a Turtle"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Photo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-950">
                Photo
              </label>
              <div className="flex items-center gap-4">
                {displayPhoto ? (
                  <div className="relative">
                    <img
                      src={displayPhoto}
                      alt="Turtle photo"
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
                  >
                    <svg
                      className="w-8 h-8"
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
                  </button>
                )}
                {!displayPhoto && (
                  <p className="text-sm text-gray-500">
                    Add a photo of your turtle
                  </p>
                )}
                {displayPhoto && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-green-700 hover:text-green-900 font-medium transition-colors"
                  >
                    Change photo
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="turtleName"
                className="block text-sm font-medium text-green-950"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="turtleName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What's your turtle's name?"
                maxLength={100}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Species */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-950">
                Species
              </label>
              <SpeciesSearch value={species} onChange={setSpecies} />
            </div>

            {/* Sex */}
            <div className="space-y-2">
              <label
                htmlFor="turtleSex"
                className="block text-sm font-medium text-green-950"
              >
                Sex
              </label>
              <select
                id="turtleSex"
                value={sex}
                onChange={(e) =>
                  setSex(e.target.value as "male" | "female" | "unknown" | "")
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            {/* Date Acquired */}
            <div className="space-y-2">
              <label
                htmlFor="dateAcquired"
                className="block text-sm font-medium text-green-950"
              >
                Date Acquired
              </label>
              <input
                id="dateAcquired"
                type="date"
                value={dateAcquired}
                onChange={(e) => setDateAcquired(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label
                htmlFor="turtleBio"
                className="block text-sm font-medium text-green-950"
              >
                About
              </label>
              <textarea
                id="turtleBio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your turtle..."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-400 text-right">
                {bio.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving
                  ? isEditing
                    ? "Saving..."
                    : "Adding..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Turtle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
