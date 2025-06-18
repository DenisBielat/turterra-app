import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface DistributionDetailsPanelProps {
  currentSpeciesId?: string | number;
  speciesName?: string;
  scientificName?: string;
  profileImageUrl?: string;
  slug?: string;
}

interface ImageData {
  public_id: string;
  secure_url: string;
  metadata: {
    primary_photo: boolean;
    life_stage: string;
    asset_type: string;
    credits_basic: string;
  };
}

const DistributionDetailsPanel: React.FC<DistributionDetailsPanelProps> = ({ 
  speciesName = "Loading...",
  scientificName,
  profileImageUrl = "/images/image-placeholder.png",
  slug
}) => {
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string>(profileImageUrl);
  const [loading, setLoading] = useState(false);

  // Fetch primary photo from Cloudinary
  useEffect(() => {
    async function fetchPrimaryPhoto() {
      if (!slug) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/cloudinary/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch images");
        const data: ImageData[] = await response.json();

        // Find the primary photo
        const primaryPhoto = data.find((img: ImageData) => img.metadata.primary_photo);
        if (primaryPhoto) {
          setPrimaryImageUrl(primaryPhoto.secure_url);
        }
      } catch (error) {
        console.error("Error fetching primary photo:", error);
        // Keep the fallback image if fetch fails
      } finally {
        setLoading(false);
      }
    }

    fetchPrimaryPhoto();
  }, [slug, profileImageUrl]);

  return (
    <div className="mb-6">
      {/* Main heading with species name */}
      <h3 className="text-xl font-semibold mb-2 text-gray-900">
        {speciesName}
      </h3>
      
      {/* Subheading */}
      <p className="text-sm text-gray-600 mb-4">
        Species Distribution Information
      </p>
      
      {/* Divider */}
      <div className="w-full h-px bg-gray-200 mb-4"></div>
      
      {/* Profile image */}
      <div className="flex justify-center mb-4">
        <div className="relative w-full h-32 rounded-lg overflow-hidden">
          {loading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-500 text-sm">Loading...</span>
            </div>
          ) : (
            <Image 
              src={primaryImageUrl} 
              alt={speciesName}
              fill
              className="object-cover"
            />
          )}
        </div>
      </div>
      
      {/* Placeholder for future content */}
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-sm text-gray-500 text-center">
          Additional distribution details coming soon...
        </p>
      </div>
    </div>
  );
};

export default DistributionDetailsPanel; 