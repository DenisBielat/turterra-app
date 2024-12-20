"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { supabase } from "@/lib/supabaseClient";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./TurtleProfileHero.module.css";

type AssetType = "Image" | "Video" | "Diagram" | "Illustration" | "Artwork";
type LifeStage = "Adult" | "Juvenile" | "Hatchling" | "Unknown";

interface ImageData {
  public_id: string;
  secure_url: string;
  metadata: {
    primary_photo: boolean;
    life_stage: LifeStage | "";
    asset_type: AssetType | "";
    credits_basic: string | "";
    width?: number;
    height?: number;
  };
}

export default function TurtleProfileHero({ slug }: { slug: string }) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [turtleName, setTurtleName] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);

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
        if (!response.ok) {
          throw new Error("Failed to fetch images from Cloudinary");
        }

        const data = await response.json();

        // Sort primary photo to appear first
        const sortedData = data.sort(
          (a: ImageData, b: ImageData) =>
            (b.metadata.primary_photo ? 1 : 0) - (a.metadata.primary_photo ? 1 : 0)
        );

        setImages(sortedData);
      } catch (error) {
        console.error("Error fetching turtle images:", error);
      }
    }

    fetchTurtleImages();
  }, [slug]);

  return (
    <section className="bg-green-950 text-white py-8">
      {/* Header */}
      <div className="text-center mx-auto w-full max-w-3xl pb-12">
        <h1 className="text-6xl font-bold leading-[1.1em]">{turtleName}</h1>
      </div>

      {/* Slider */}
      <div className={styles.sliderWrapper}>
        <div className={styles.swiperContainer}>
        <div className={styles.navContainer}>
            <div className={`${styles.navButton} ${styles.navButtonLeft}`}>
              &lt;
            </div>
            <div className={`${styles.navButton} ${styles.navButtonRight}`}>
              &gt;
            </div>
          </div>
          
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: `.${styles.navButtonLeft}`,
              nextEl: `.${styles.navButtonRight}`,
            }}
            loop
            centeredSlides
            slidesPerView="auto"
            className={styles.swiperWrapper}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {images.map((image, index) => (
              <SwiperSlide
                key={index}
                className={styles.swiperSlide}
                style={{
                  width: `${image.metadata.width || "auto"}`,
                  height: `${image.metadata.height || "472px"}`,
                }}
              >
                {/* Image */}
                <div className={styles.mediaData}>
                  <img
                    src={image.secure_url}
                    alt={`${turtleName} image`}
                    title={image.metadata.life_stage || ""}
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
                  <div className="flex justify-end items-center gap-2 text-gray-300">
                    {image.metadata.life_stage && (
                      <span className="italic">{image.metadata.life_stage}</span>
                    )}
                    {image.metadata.asset_type && (
                      <span className="font-semibold">{image.metadata.asset_type}</span>
                    )}
                    {image.metadata.credits_basic && (
                      <span>{image.metadata.credits_basic}</span>
                    )}
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