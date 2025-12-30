import type { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "@/lib/db/cloudinary";

type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  metadata?: {
    [key: string]: string;
  };
  context?: {
    custom?: {
      [key: string]: string;
    };
    [key: string]: unknown;
  };
};

type CloudinaryResponse = {
  resources: CloudinaryResource[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { species } = req.query;

  if (!species || typeof species !== "string") {
    return res.status(400).json({ error: "Invalid species parameter" });
  }

  const formattedSpecies = species.replace(/\s+/g, "-");
  const assetFolder = `Turtle Species Photos/${formattedSpecies}`;

  console.log("Asset folder being queried:", assetFolder); // Debugging log

  try {
    const result: CloudinaryResponse = await cloudinary.api.resources_by_asset_folder(assetFolder, {
      max_results: 500,
      context: true,
      metadata: true,
    });

    if (result.resources.length === 0) {
      console.log("No images found in:", assetFolder); // Log for empty folder
      return res.status(404).json({ error: "No images found for this species" });
    }

    // Log first image to debug metadata structure
    if (result.resources.length > 0) {
      console.log("Sample image metadata:", JSON.stringify(result.resources[0].metadata, null, 2));
      console.log("Sample image context:", JSON.stringify(result.resources[0].context, null, 2));
    }

    const processedImages = result.resources.map((image) => {
      // Cloudinary custom metadata can be in:
      // 1. context.custom (most common for custom fields)
      // 2. context (directly)
      // 3. metadata (for EXIF/IPTC data, but sometimes custom fields too)
      const contextCustom = image.context?.custom || {};
      const contextDirect = image.context || {};
      const metadata = image.metadata || {};
      
      // Merge all sources, with priority: context.custom > context > metadata
      const customData = { ...metadata, ...contextDirect, ...contextCustom };
      
      return {
        public_id: image.public_id,
        secure_url: image.secure_url,
        metadata: {
          primary_photo: customData.primary_photo === "true" || customData.primary_photo === true,
          // Map life_stage (singular) to pictured_life_stages (plural) for consistency
          pictured_life_stages: customData.pictured_life_stages || customData.life_stage || "",
          life_stages_descriptor: customData.life_stages_descriptor || "",
          asset_type: customData.asset_type || "",
          credits_basic: customData.credits_basic || "",
          credits_full: customData.credits_full || "",
          author: customData.author || "",
        },
      };
    });

    // Sort images to put the primary photo first
    processedImages.sort((a, b) => (b.metadata.primary_photo ? 1 : 0) - (a.metadata.primary_photo ? 1 : 0));

    res.status(200).json(processedImages);
} catch (error) {
    console.error("Cloudinary fetch error:", error);
  
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
  
    res.status(500).json({
      error: "Error fetching data from Cloudinary",
      details: errorMessage,
    });
  }
}  