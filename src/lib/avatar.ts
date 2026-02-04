import imageCompression from "browser-image-compression";

/**
 * Compress and resize an image before upload.
 * Target: max 500x500px, max 500KB, WebP format.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 500,
    useWebWorker: true,
    fileType: "image/webp" as const,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Image compression failed:", error);
    throw new Error("Failed to process image");
  }
}

/**
 * Create a cropped image from the original based on pixel crop area.
 */
export function getCroppedImage(
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  fileName: string
): Promise<File> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Account for any scaling between the natural image size and displayed size
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to Blob failed"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/webp" }));
      },
      "image/webp",
      0.9
    );
  });
}

/**
 * Generate the storage path for a user's avatar.
 * Structure: {user_id}/avatar.webp
 */
export function getAvatarPath(userId: string): string {
  return `${userId}/avatar.webp`;
}
