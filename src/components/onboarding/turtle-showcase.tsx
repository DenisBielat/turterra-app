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
 * Displays a random turtle with its image and a fun fact.
 * Used on the left side of the onboarding split-screen layout.
 *
 * Features:
 * - Fetches random turtle on mount
 * - Beautiful image with gradient overlay
 * - Species name and scientific name
 * - Fun fact from the at_a_glance description
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

  // Truncate fact to a reasonable length
  const truncatedFact =
    turtle?.fact && turtle.fact.length > 280
      ? turtle.fact.substring(0, 280).trim() + "..."
      : turtle?.fact;

  return (
    <div className="relative w-full h-full overflow-hidden">
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-950/40 to-green-950/20" />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      {turtle && !loading && (
        <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
          {/* Turterra Logo */}
          <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
            <Image
              src="/images/turterra-logo-white-text.png"
              alt="Turterra"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          {/* Turtle Info Card */}
          <div className="space-y-4">
            {/* Species Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 text-sm font-medium">
                Featured Species
              </span>
            </div>

            {/* Species Name */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white font-heading">
                {turtle.commonName}
              </h2>
              <p className="text-green-300 italic text-lg mt-1">
                {turtle.scientificName}
              </p>
            </div>

            {/* Fun Fact */}
            {truncatedFact && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-md">
                <p className="text-white/90 text-sm leading-relaxed">
                  {truncatedFact}
                </p>
              </div>
            )}

            {/* Decorative Element */}
            <div className="flex items-center gap-2 pt-4">
              <div className="h-px flex-1 bg-gradient-to-r from-green-400/50 to-transparent" />
              <span className="text-green-400/70 text-xs tracking-wider uppercase">
                Did you know?
              </span>
              <div className="h-px w-8 bg-green-400/30" />
            </div>
          </div>
        </div>
      )}

      {/* Fallback when no image */}
      {!turtle?.imageUrl && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-800 to-green-950">
          <div className="text-center space-y-4 p-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-700/50 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-400"
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
