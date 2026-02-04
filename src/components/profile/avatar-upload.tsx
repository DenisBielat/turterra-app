"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createClient } from "@/lib/supabase/client";
import { compressImage, getCroppedImage, getAvatarPath } from "@/lib/avatar";
import { UserAvatar } from "@/components/user-avatar";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  displayName: string | null;
  username: string;
  /** Avatar size variant */
  size?: "lg" | "xl";
  onUploadComplete: (url: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  displayName,
  username,
  size = "xl",
  onUploadComplete,
}: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setError(null);
      const file = e.target.files[0];

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Please select a JPG, PNG, or WebP image");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setIsOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, 1));
    },
    []
  );

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current) {
      setError("Please select a crop area");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const croppedFile = await getCroppedImage(
        imgRef.current,
        completedCrop,
        "avatar.webp"
      );
      const compressedFile = await compressImage(croppedFile);

      const supabase = createClient();
      const avatarPath = getAvatarPath(userId);

      // Upload (upsert overwrites the old file)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(avatarPath, compressedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(avatarPath);

      // Cache-busting param so the browser shows the new image
      const urlWithCacheBust = `${publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlWithCacheBust })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUploadComplete(urlWithCacheBust);
      handleClose();
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const avatarPath = getAvatarPath(userId);

      await supabase.storage.from("avatars").remove([avatarPath]);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (updateError) throw updateError;

      onUploadComplete("");
    } catch (err) {
      console.error("Avatar removal error:", err);
      setError("Failed to remove avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Avatar with camera button overlay */}
      <div className="relative">
        <UserAvatar
          avatarUrl={currentAvatarUrl}
          displayName={displayName}
          username={username}
          size={size}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          aria-label="Change avatar"
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
      </div>

      {/* Remove button (only shown if there is an avatar) */}
      {currentAvatarUrl && (
        <button
          type="button"
          onClick={handleRemoveAvatar}
          disabled={uploading}
          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Remove photo
        </button>
      )}

      {error && !isOpen && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onSelectFile}
        className="hidden"
        aria-label="Select avatar image"
      />

      {/* Crop Modal */}
      {isOpen && imageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-green-950/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-green-950 font-heading">
                Crop Your Photo
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
            </div>

            {/* Body */}
            <div className="p-4">
              {error && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="text-center text-sm text-gray-500 mb-3">
                Drag to reposition. Your photo will be displayed as a circle.
              </p>

              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={{ maxHeight: "400px", maxWidth: "100%" }}
                  />
                </ReactCrop>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
              <button
                onClick={handleClose}
                disabled={uploading}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !completedCrop}
                className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? "Uploading..." : "Save Photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
