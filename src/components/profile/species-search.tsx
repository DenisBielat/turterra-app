"use client";

import { useState, useEffect, useRef } from "react";

interface SpeciesResult {
  species_common_name: string;
  species_scientific_name: string;
  slug: string;
  avatar_image_circle_url: string | null;
}

interface SpeciesSearchProps {
  value: {
    species_id: number | null;
    species_common_name: string;
    species_scientific_name: string;
  };
  onChange: (value: {
    species_id: number | null;
    species_common_name: string;
    species_scientific_name: string;
  }) => void;
}

export function SpeciesSearch({ value, onChange }: SpeciesSearchProps) {
  const [query, setQuery] = useState(value.species_common_name || "");
  const [results, setResults] = useState<SpeciesResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Search species as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search-turtles?query=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(data.length > 0);
        }
      } catch {
        // Silently fail on network errors
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SpeciesResult) => {
    onChange({
      species_id: null, // We don't have the numeric ID from the search endpoint
      species_common_name: result.species_common_name,
      species_scientific_name: result.species_scientific_name,
    });
    setQuery(result.species_common_name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({
      species_id: null,
      species_common_name: "",
      species_scientific_name: "",
    });
    setQuery("");
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // If user is typing, clear the selected species
            if (value.species_common_name && e.target.value !== value.species_common_name) {
              onChange({
                species_id: null,
                species_common_name: "",
                species_scientific_name: "",
              });
            }
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search for a species..."
          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
        />
        {(query || value.species_common_name) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Selected species indicator */}
      {value.species_common_name && value.species_scientific_name && (
        <p className="mt-1 text-xs text-green-600">
          <span className="italic">{value.species_scientific_name}</span>
        </p>
      )}

      {/* Loading indicator */}
      {loading && (
        <p className="mt-1 text-xs text-gray-400">Searching...</p>
      )}

      {/* Dropdown results */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.slug}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {result.avatar_image_circle_url ? (
                <img
                  src={result.avatar_image_circle_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-950 truncate">
                  {result.species_common_name}
                </p>
                <p className="text-xs text-gray-500 italic truncate">
                  {result.species_scientific_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
