"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface OnboardingFormProps {
  userId: string;
  userEmail: string;
}

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

/**
 * Onboarding Form
 *
 * Allows new users to pick their username and optionally set a display name.
 *
 * FEATURES:
 * - Real-time username format validation (client-side)
 * - Debounced username availability check (server-side via Supabase RPC)
 * - Visual feedback for username status
 * - Creates profile in database on submit
 *
 * USERNAME RULES:
 * - 3-30 characters
 * - Must start with a letter
 * - Only lowercase letters, numbers, and underscores allowed
 * - Must be unique and not reserved
 */
export function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced username validation
  useEffect(() => {
    // Reset if empty
    if (!username) {
      setUsernameStatus("idle");
      return;
    }

    // First validate format (client-side)
    // Must: start with letter, 3-30 chars, only lowercase letters/numbers/underscores
    const isValidFormat = /^[a-z][a-z0-9_]{2,29}$/.test(username);

    if (!isValidFormat) {
      setUsernameStatus("invalid");
      return;
    }

    // Format is valid, now check availability with debounce
    setUsernameStatus("checking");

    const timeout = setTimeout(async () => {
      try {
        const supabase = createClient();

        // Call the database function to check availability
        // This checks both the profiles table and reserved_usernames table
        const { data, error: rpcError } = await supabase.rpc(
          "is_username_available",
          { desired_username: username }
        );

        if (rpcError) {
          console.error("Username check error:", rpcError);
          setUsernameStatus("idle");
          return;
        }

        setUsernameStatus(data ? "available" : "taken");
      } catch (err) {
        console.error("Username check failed:", err);
        setUsernameStatus("idle");
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Normalize to lowercase and remove any @ prefix the user might type
    const value = e.target.value.toLowerCase().replace(/^@/, "");
    setUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Verify username is available before submitting
    if (usernameStatus !== "available") {
      setError("Please choose a valid, available username");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Create the profile
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        username,
        display_name: displayName.trim() || null,
      });

      if (insertError) {
        // Handle race condition where username was taken between check and insert
        if (insertError.code === "23505") {
          // Unique violation
          setError("Username was just taken. Please choose another.");
          setUsernameStatus("taken");
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

      // Success! Navigate to the user's new profile
      router.push(`/user/${username}`);
      router.refresh();
    } catch (err) {
      console.error("Profile creation failed:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (usernameStatus) {
      case "checking":
        return (
          <svg
            className="w-5 h-5 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case "available":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "taken":
      case "invalid":
        return (
          <svg
            className="w-5 h-5 text-red-500"
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
        );
      default:
        return null;
    }
  };

  const getHelperText = () => {
    switch (usernameStatus) {
      case "checking":
        return (
          <span className="text-gray-500">Checking availability...</span>
        );
      case "available":
        return <span className="text-green-600">Username is available!</span>;
      case "taken":
        return <span className="text-red-500">Username is already taken</span>;
      case "invalid":
        return (
          <span className="text-red-500">
            Must be 3-30 characters, start with a letter, and use only lowercase
            letters, numbers, and underscores
          </span>
        );
      default:
        return (
          <span className="text-gray-500">
            This will be your unique @username
          </span>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-green-950"
        >
          Username <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">
            @
          </span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            required
            placeholder="turtlelover"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full pl-8 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {getStatusIcon()}
          </span>
        </div>
        <p className="text-xs mt-1">{getHelperText()}</p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-green-950"
        >
          Display Name{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you want your name to appear"
          maxLength={50}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-500">
          You can always change this later
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || usernameStatus !== "available"}
        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Creating profile..." : "Complete Setup"}
      </button>
    </form>
  );
}
