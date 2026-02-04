"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserTurtle } from "@/types/database";
import { SpeciesSearch } from "./species-search";
import { compressImage } from "@/lib/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TurtleFormProps {
  userId: string;
  turtle?: UserTurtle;
  onClose: () => void;
}

// Generate year options from current year back to 1950
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) =>
  (currentYear - i).toString()
);

const monthOptions = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getDaysInMonth(year: string, month: string): string[] {
  if (!year || !month) return [];
  const daysCount = new Date(parseInt(year), parseInt(month), 0).getDate();
  return Array.from({ length: daysCount }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
}

function parseDateAcquired(dateStr: string | null): {
  year: string;
  month: string;
  day: string;
} {
  if (!dateStr) return { year: "", month: "", day: "" };

  // Handle formats: "2020", "2020-06", "2020-06-15"
  const parts = dateStr.split("-");
  return {
    year: parts[0] || "",
    month: parts[1] && parts[1] !== "01" ? parts[1] : parts[1] === "01" && parts[2] === "01" ? "" : parts[1] || "",
    day: parts[2] && parts[2] !== "01" ? parts[2] : "",
  };
}

function formatDateForStorage(year: string, month: string, day: string): string | null {
  if (!year || year === "none") return null;
  if (!month || month === "none") return `${year}-01-01`; // Year only
  if (!day || day === "none") return `${year}-${month}-01`; // Year + month
  return `${year}-${month}-${day}`; // Full date
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
  const [sex, setSex] = useState<"male" | "female" | "unknown" | "not-specified">(
    turtle?.sex || "not-specified"
  );

  // Parse existing date into components
  const existingDate = parseDateAcquired(turtle?.date_acquired ?? null);
  const [dateYear, setDateYear] = useState(existingDate.year);
  const [dateMonth, setDateMonth] = useState(existingDate.month);
  const [dateDay, setDateDay] = useState(existingDate.day);

  const [photoUrl, setPhotoUrl] = useState(turtle?.photo_url || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!turtle;
  const dayOptions = getDaysInMonth(dateYear, dateMonth);

  // Reset day if month changes and day is no longer valid
  useEffect(() => {
    if (dateDay && dayOptions.length > 0 && !dayOptions.includes(dateDay)) {
      setDateDay("");
    }
  }, [dateMonth, dateYear, dateDay, dayOptions]);

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
      .from("user-turtle-photos")
      .upload(path, compressed, { upsert: true, cacheControl: "3600" });

    if (uploadError) throw new Error("Failed to upload photo");

    const {
      data: { publicUrl },
    } = supabase.storage.from("user-turtle-photos").getPublicUrl(path);

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
      const dateAcquired = formatDateForStorage(dateYear, dateMonth, dateDay);

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
            photo_url: finalPhotoUrl || null,
            sex: sex && sex !== "not-specified" ? (sex as "male" | "female" | "unknown") : null,
            date_acquired: dateAcquired,
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
            sex: sex && sex !== "not-specified" ? (sex as "male" | "female" | "unknown") : null,
            date_acquired: dateAcquired,
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
              <label className="block text-sm font-medium text-green-950">
                Sex
              </label>
              <Select
                value={sex}
                onValueChange={(value) =>
                  setSex(value as "male" | "female" | "unknown" | "not-specified")
                }
              >
                <SelectTrigger className="w-full px-4 py-3 h-auto rounded-xl border border-gray-200 bg-white text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                  <SelectValue placeholder="Not specified" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="not-specified">Not specified</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Acquired */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-950">
                Date Acquired
              </label>
              <div className="flex gap-2">
                {/* Year */}
                <Select value={dateYear} onValueChange={(v) => {
                  setDateYear(v);
                  if (!v) {
                    setDateMonth("");
                    setDateDay("");
                  }
                }}>
                  <SelectTrigger className="flex-1 px-4 py-3 h-auto rounded-xl border border-gray-200 bg-white text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-60">
                    <SelectItem value="none">No year</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Month (optional, shown when year selected) */}
                <Select
                  value={dateMonth}
                  onValueChange={(v) => {
                    setDateMonth(v);
                    if (!v) setDateDay("");
                  }}
                  disabled={!dateYear || dateYear === "none"}
                >
                  <SelectTrigger className="flex-1 px-4 py-3 h-auto rounded-xl border border-gray-200 bg-white text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">No month</SelectItem>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Day (optional, shown when month selected) */}
                <Select
                  value={dateDay}
                  onValueChange={setDateDay}
                  disabled={!dateMonth || dateMonth === "none"}
                >
                  <SelectTrigger className="w-24 px-4 py-3 h-auto rounded-xl border border-gray-200 bg-white text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-60">
                    <SelectItem value="none">No day</SelectItem>
                    {dayOptions.map((day) => (
                      <SelectItem key={day} value={day}>
                        {parseInt(day)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-400">
                You can enter just the year, or be more specific
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
