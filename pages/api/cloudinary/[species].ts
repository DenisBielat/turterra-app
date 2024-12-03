import type { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "@/lib/cloudinary";

type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  metadata?: {
    primary_photo?: string;
    life_stage?: string;
    asset_type?: string;
    credits_basic?: string;
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

    const processedImages = result.resources.map((image) => ({
      public_id: image.public_id,
      secure_url: image.secure_url,
      metadata: {
        primary_photo: image.metadata?.primary_photo === "true",
        life_stage: image.metadata?.life_stage || "",
        asset_type:
        image.metadata?.asset_type || "",
        credits_basic: image.metadata?.credits_basic || "",
      },
    }));

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