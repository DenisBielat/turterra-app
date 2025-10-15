import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/db/supabaseClient';
import type { DistributionDetail } from '@/types/turtleTypes';
import { Icon } from '@/components/Icon';

interface DistributionDetailsPanelProps {
  currentSpeciesId?: string | number;
  speciesName?: string;
  scientificName?: string;
  profileImageUrl?: string;
  slug?: string;
  distributionDescription?: string;
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
  slug,
  currentSpeciesId,
  distributionDescription
}) => {
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string>(profileImageUrl);
  const [loading, setLoading] = useState(false);
  const [distributionDetails, setDistributionDetails] = useState<DistributionDetail[]>([]);

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

  // Fetch distribution details
  useEffect(() => {
    async function fetchDistributionDetails() {
      if (!currentSpeciesId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_species_distribution_details', { p_species_id: currentSpeciesId });
        
        if (error) throw error;
        setDistributionDetails(data);
      } catch (error) {
        console.error("Error fetching distribution details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDistributionDetails();
  }, [currentSpeciesId]);

  return (
    <div className="h-full flex flex-col">
      {/* Main heading with species name */}
      <h3 className="text-xl font-semibold mb-2">
        {speciesName}
      </h3>
      
      {/* Subheading */}
      <p className="text-sm text-gray-600 mb-4">
        Species Distribution Information
      </p>
      
      {/* Divider */}
      <div className="w-full h-px bg-gray-200 mb-4"></div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
        {/* Profile image */}
        <div className="flex justify-center mb-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
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
        
        {/* Distribution Description */}
        {distributionDescription && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Distribution Overview</h4>
            <p className="text-sm text-gray-700">
              {distributionDescription}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-4"></div>

        {/* Country List */}
        <div className="space-y-2">
          {distributionDetails.map((dist, index) => (
            <div key={index} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon name="earth-locate" style="line" size="base" />
                  <span className="font-semibold">{dist.country_name}</span>
                </div>
                <Icon name="arrow-right-1" style="line" size="sm" className="text-gray-400" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-gray-200">{dist.origin}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${dist.population_trend === 'Stable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{dist.population_trend}</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">{dist.state_count > 0 ? `${dist.state_count} states/provinces` : 'No specific states/provinces listed'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistributionDetailsPanel; 