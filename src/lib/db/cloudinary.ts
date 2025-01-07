import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  tags: string[];
  metadata: {
    primary_photo: boolean;
    life_stage: string;
    asset_type: string;
    credits_basic: string;
  };
}

export async function getPhysicalFeatureImages(species: string) {
  const formattedSpecies = species.toLowerCase().replace(/\s+/g, '-');
  const assetFolder = `Turtle Species Photos/${formattedSpecies}/physical-features`;

  try {
    console.log('Fetching images for:', assetFolder);
    const result = await cloudinary.api.resources_by_asset_folder(assetFolder, {
      max_results: 500,
      tags: true
    });

    console.log('Found images:', result.resources.length);
    const images = result.resources.map(image => ({
      url: image.secure_url,
      tags: image.tags || []
    }));
    console.log('Processed images:', images);
    return images;
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    return [];
  }
}

export default cloudinary;