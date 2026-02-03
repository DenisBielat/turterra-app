"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface TurtleData {
  commonName: string;
  scientificName: string;
  slug: string;
  imageUrl: string | null;
  fact: string | null;
}

/**
 * Turtle Showcase Component
 *
 * Displays a random turtle in a contained card format.
 * Black gradient overlay on the bottom half, species name and fun fact at bottom.
 */
export function TurtleShowcase() {
  const [turtle, setTurtle] = useState<TurtleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRandomTurtle() {
      try {
        const response = await fetch("/api/random-turtle");
        if (response.ok) {
          const data = await response.json();
          setTurtle(data);
        }
      } catch (error) {
        console.error("Failed to fetch random turtle:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRandomTurtle();
  }, []);

  // Truncate fact to keep the overlay compact
  const truncatedFact =
    turtle?.fact && turtle.fact.length > 200
      ? turtle.fact.substring(0, 200).trim() + "..."
      : turtle?.fact;

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Background Image */}
      {turtle?.imageUrl && (
        <Image
          src={turtle.imageUrl}
          alt={turtle.commonName}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Black gradient - 100% opacity at bottom, fading to 0% at midpoint */}
      <div className="absolute inset-0 bg-gradient-to-t from-black from-0% via-black/60 via-30% to-transparent to-50%" />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-900/80">
          <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Content at bottom */}
      {turtle && !loading && (
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {/* Species Name */}
          <h2 className="text-3xl font-bold text-white font-heading">
            {turtle.commonName}
          </h2>
          <p className="text-white/60 italic text-base mt-1 mb-2">
            {turtle.scientificName}
          </p>

          {/* Fun Fact */}
          {truncatedFact && (
            <p className="text-white/80 text-sm leading-relaxed max-w-md">
              {truncatedFact}
            </p>
          )}
        </div>
      )}

      {/* Fallback when no image */}
      {!turtle?.imageUrl && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-900">
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-800 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <p className="text-green-300 text-lg font-medium">
              Welcome to the turtle community
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
