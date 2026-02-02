"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useCallback } from "react";

interface AuthModalProps {
  children: React.ReactNode;
}

/**
 * Auth Modal Component
 *
 * A modal wrapper for authentication forms.
 * Uses router.back() to close, returning the user to their previous page.
 */
export function AuthModal({ children }: AuthModalProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop - click to close */}
      <div
        className="absolute inset-0 bg-green-950/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Modal card */}
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
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

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image
                src="/images/logomark-green-500.png"
                alt="Turterra"
                width={56}
                height={56}
                className="h-14 w-14"
                priority
              />
            </Link>
          </div>

          {/* Form content */}
          {children}
        </div>
      </div>
    </div>
  );
}
