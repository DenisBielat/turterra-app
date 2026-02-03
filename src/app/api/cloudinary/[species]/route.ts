import { NextRequest, NextResponse } from "next/server";
import cloudinary, { sanitizeSpeciesNameForCloudinary } from "@/lib/db/cloudinary";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ species: string }> }
) {
  const { species } = await params;

  if (!species || typeof species !== "string") {
    return NextResponse.json(
      { error: "Invalid species parameter" },
      { status: 400 }
    );
  }

  const formattedSpecies = sanitizeSpeciesNameForCloudinary(species);
  const assetFolder = `Turtle Species Photos/${formattedSpecies}`;

  try {
    const result = await cloudinary.api.resources_by_asset_folder(assetFolder, {
      max_results: 500,
      context: true,
      metadata: true,
    });

    const resourceCount: number = result.resources.length;
    if (resourceCount === 0) {
      return NextResponse.json(
        { error: "No images found for this species" },
        { status: 404 }
      );
    }

    const processedImages = result.resources.map((image) => {
      const context = image.context as Record<string, unknown> | undefined;
      const contextCustom =
        (context?.custom as Record<string, unknown>) || {};
      const contextDirect = context || {};
      const metadata = (image.metadata as Record<string, unknown>) || {};

      const customData: Record<string, unknown> = {
        ...metadata,
        ...contextDirect,
        ...contextCustom,
      };

      return {
        public_id: image.public_id,
        secure_url: image.secure_url,
        metadata: {
          primary_photo:
            customData.primary_photo === "true" ||
            customData.primary_photo === true,
          pictured_life_stages:
            customData.pictured_life_stages || customData.life_stage || "",
          life_stages_descriptor: customData.life_stages_descriptor || "",
          asset_type: customData.asset_type || "",
          credits_basic: customData.credits_basic || "",
          credits_full: customData.credits_full || "",
          author: customData.author || "",
        },
      };
    });

    processedImages.sort(
      (a, b) =>
        (b.metadata.primary_photo ? 1 : 0) -
        (a.metadata.primary_photo ? 1 : 0)
    );

    return NextResponse.json(processedImages);
  } catch (error) {
    console.error("Cloudinary fetch error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Error fetching data from Cloudinary",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
