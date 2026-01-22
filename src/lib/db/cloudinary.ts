import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// interface CloudinaryImage {
//   public_id: string;
//   secure_url: string;
//   tags: string[];
//   metadata: {
//     primary_photo: boolean;
//     life_stage: string;
//     asset_type: string;
//     credits_basic: string;
//   };
// }

/**
 * Sanitizes a species name for use in Cloudinary folder paths.
 * Removes apostrophes and other special characters that might cause issues.
 * 
 * @param species - The species name to sanitize
 * @returns A sanitized string suitable for folder names (lowercase, hyphens instead of spaces, no special chars)
 */
export function sanitizeSpeciesNameForCloudinary(species: string): string {
  return species
    .toLowerCase()
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[^\w\s-]/g, '') // Remove any other special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export async function getPhysicalFeatureImages(species: string) {
  const formattedSpecies = sanitizeSpeciesNameForCloudinary(species);
  const assetFolder = `Turtle Species Photos/${formattedSpecies}/physical-features`;

  try {
    const result = await cloudinary.api.resources_by_asset_folder(assetFolder, {
      max_results: 500,
      tags: true,
      context: true,
      metadata: true
    });

    const images = result.resources.map(image => {
      // Cloudinary custom metadata can be in:
      // 1. context.custom (most common for custom fields)
      // 2. context (directly)
      // 3. metadata (for EXIF/IPTC data, but sometimes custom fields too)
      const context = image.context as Record<string, unknown> | undefined;
      const contextCustom = (context?.custom as Record<string, unknown>) || {};
      const contextDirect = context || {};
      const metadata = (image.metadata as Record<string, unknown>) || {};
      
      // Merge all sources, with priority: context.custom > context > metadata
      const customData: Record<string, unknown> = { ...metadata, ...contextDirect, ...contextCustom };
      
      // Helper to safely convert unknown values to string
      const toString = (value: unknown): string => {
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return value;
        return String(value);
      };
      
      return {
        url: image.secure_url,
        tags: image.tags || [],
        metadata: {
          pictured_life_stages: toString(customData.pictured_life_stages || customData.life_stage),
          life_stages_descriptor: toString(customData.life_stages_descriptor),
          asset_type: toString(customData.asset_type),
          credits_basic: toString(customData.credits_basic),
        }
      };
    });
    return images;
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    return [];
  }
}

export default cloudinary;