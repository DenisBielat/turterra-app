"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { supabase } from "@/lib/db/supabaseClient";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./TurtleProfileHero.module.css";
import Icon from "@/components/Icon";

type AssetType = "Image" | "Video" | "Diagram" | "Illustration" | "Artwork";

interface ImageData {
  public_id: string;
  secure_url: string;
  metadata: {
    primary_photo: boolean;
    pictured_life_stages: string;
    life_stages_descriptor: string;
    asset_type: AssetType | "";
    credits_basic: string;
    credits_full: string;
    author: string;
    width?: number;
    height?: number;
  };
}

interface TurtleProfileHeroProps {
  slug: string;
  onPrimaryImageLoad?: (imageUrl: string) => void;
}

export default function TurtleProfileHero({ slug, onPrimaryImageLoad }: TurtleProfileHeroProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [turtleName, setTurtleName] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [initialSlide, setInitialSlide] = useState(0);

  // Fetch Turtle Name from Supabase
  useEffect(() => {
    async function fetchTurtleName() {
      try {
        const { data, error } = await supabase
          .from("turtle_species")
          .select("species_common_name")
          .eq("slug", slug)
          .single();

        if (error) throw error;

        setTurtleName(data.species_common_name || "Turtle Species");
      } catch (error) {
        console.error("Error fetching turtle name:", error);
        setTurtleName("Turtle Species"); // Fallback name
      }
    }

    fetchTurtleName();
  }, [slug]);

  // Fetch Images from Cloudinary
  useEffect(() => {
    async function fetchTurtleImages() {
      try {
        const response = await fetch(`/api/cloudinary/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();

        // Find primary photo and its index
        const primaryPhotoIndex = data.findIndex((img: ImageData) => img.metadata.primary_photo);
        const primaryPhoto = primaryPhotoIndex >= 0 ? data[primaryPhotoIndex] : null;

        if (primaryPhoto && onPrimaryImageLoad) {
          onPrimaryImageLoad(primaryPhoto.secure_url);
        }

        // Set initial slide to primary photo index (or 0 if not found)
        if (primaryPhotoIndex >= 0) {
          setInitialSlide(primaryPhotoIndex);
          setActiveIndex(primaryPhotoIndex);
        }

        setImages(data);
      } catch (error) {
        console.error("Error fetching turtle images:", error);
      }
    }

    fetchTurtleImages();
  }, [slug, onPrimaryImageLoad]);

  return (
    <section className="bg-green-950 text-white">
      {/* Header */}
      <div className="text-center mx-auto w-full max-w-3xl px-4 pb-8 lg:pb-12">
        <h1 className="text-3xl lg:text-6xl font-bold text-white leading-[1.1em]">{turtleName}</h1>
      </div>

      {/* Slider */}
      <div className={styles.sliderWrapper}>
        <div className={styles.swiperContainer}>
          <div className={`${styles.navContainer} hidden lg:block`}>
            <div className={`${styles.navButton} ${styles.navButtonLeft}`}>
              <Icon name="arrow-left-1" style="line" size="lg" />
            </div>
            <div className={`${styles.navButton} ${styles.navButtonRight}`}>
              <Icon name="arrow-right-1" style="line" size="lg" />
            </div>
          </div>
          
          <Swiper
            key={`swiper-${images.length}-${initialSlide}`}
            modules={[Navigation]}
            navigation={{
              prevEl: `.${styles.navButtonLeft}`,
              nextEl: `.${styles.navButtonRight}`,
            }}
            loop
            centeredSlides
            slidesPerView="auto"
            initialSlide={initialSlide}
            className={styles.swiperWrapper}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {images.map((image, index) => (
              <SwiperSlide
                key={index}
                className={styles.swiperSlide}
                style={{
                  width: `${image.metadata.width || "auto"}`,
                }}
              >
                {/* Image */}
                <div className={styles.mediaData}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.secure_url}
                    alt={`${turtleName} image`}
                    title={image.metadata.pictured_life_stages || ""}
                    loading="lazy"
                    className={styles.image}
                  />
                </div>

                {/* Attribution */}
                <div
                  className={`${styles.mediaAttribution} ${
                    index === activeIndex ? styles.visible : ""
                  }`}
                >
                  <div className="flex justify-end items-center text-sm text-gray-300">
                    {(() => {
                      // Helper function to capitalize first letter
                      const capitalize = (str: string) => {
                        if (!str) return "";
                        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                      };

                      const parts: string[] = [];
                      
                      // Format life stages with proper capitalization
                      if (image.metadata.life_stages_descriptor && image.metadata.pictured_life_stages) {
                        // If descriptor exists: capitalize descriptor, lowercase life stage
                        const descriptor = capitalize(image.metadata.life_stages_descriptor);
                        const lifeStage = image.metadata.pictured_life_stages.toLowerCase();
                        parts.push(`${descriptor} ${lifeStage}`);
                      } else if (image.metadata.pictured_life_stages) {
                        // If no descriptor: capitalize life stage
                        parts.push(capitalize(image.metadata.pictured_life_stages));
                      } else if (image.metadata.life_stages_descriptor) {
                        // Only descriptor, no life stage
                        parts.push(capitalize(image.metadata.life_stages_descriptor));
                      }
                      
                      // Join life stage parts and add period if we have any
                      let attributionText = "";
                      if (parts.length > 0) {
                        attributionText = parts.join(" ") + ". ";
                      }
                      
                      // Add asset type (capitalized) and credits basic
                      if (image.metadata.asset_type && image.metadata.credits_basic) {
                        const assetType = capitalize(image.metadata.asset_type);
                        attributionText += `${assetType}: ${image.metadata.credits_basic}`;
                      } else if (image.metadata.asset_type) {
                        attributionText += capitalize(image.metadata.asset_type);
                      } else if (image.metadata.credits_basic) {
                        attributionText += image.metadata.credits_basic;
                      }
                      
                      return attributionText ? <span>{attributionText}</span> : null;
                    })()}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}