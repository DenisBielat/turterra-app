"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface OnboardingWizardProps {
  userId: string;
  userEmail: string;
}

type Step = 1 | 2 | 3;
type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const TOTAL_STEPS = 3;

/**
 * Onboarding Wizard Component
 *
 * A multi-step form for new user profile setup:
 * 1. Username selection (required)
 * 2. Profile details (optional: display name, bio, location)
 * 3. Review and complete
 */
export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  // Username validation
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  // Debounced username validation
  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }

    const isValidFormat = /^[a-z][a-z0-9_]{2,29}$/.test(username);
    if (!isValidFormat) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");

    const timeout = setTimeout(async () => {
      try {
        const supabase = createClient();
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
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/^@/, "");
    setUsername(value);
  };

  const canProceedFromStep1 = usernameStatus === "available";

  const handleNext = () => {
    if (currentStep === 1 && canProceedFromStep1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleComplete = async () => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        username,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("Username was just taken. Please go back and choose another.");
          setCurrentStep(1);
          setUsernameStatus("taken");
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

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
        return <span className="text-gray-500">Checking availability...</span>;
      case "available":
        return <span className="text-green-600">Username is available!</span>;
      case "taken":
        return <span className="text-red-500">Username is already taken</span>;
      case "invalid":
        return (
          <span className="text-red-500">
            3-30 characters, starts with a letter, lowercase letters, numbers, and underscores only
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

  // Calculate progress percentage
  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-950 font-heading mb-3">
          Welcome to Turterra
        </h1>
        <p className="text-gray-500 text-lg">
          Let&apos;s set up your profile so you can start exploring
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Step Content Card with Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Subtle Progress Bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-green-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-8 lg:p-10">
          {/* Step 1: Username */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">@</span>
                </div>
                <h2 className="text-2xl font-bold text-green-950 font-heading">
                  Choose your username
                </h2>
                <p className="text-gray-500 mt-2">
                  This will be your unique identifier on Turterra
                </p>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-green-950"
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    @
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
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
                <p className="text-xs">{getHelperText()}</p>
              </div>
            </div>
          )}

          {/* Step 2: Profile Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-950 font-heading">
                  Complete your profile
                </h2>
                <p className="text-gray-500 mt-2">
                  Add some details to personalize your experience (all optional)
                </p>
              </div>

              <div className="space-y-5 max-w-md mx-auto">
                <div className="space-y-2">
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-green-950"
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-green-950"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your love for turtles..."
                    maxLength={250}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right">
                    {bio.length}/250 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-green-950"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
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
                </div>
                <h2 className="text-2xl font-bold text-green-950 font-heading">
                  You&apos;re all set!
                </h2>
                <p className="text-gray-500 mt-2">
                  Review your profile before getting started
                </p>
              </div>

              {/* Profile Preview */}
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-green-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-green-950">
                        {displayName || username}
                      </h3>
                      <p className="text-gray-500 text-sm">@{username}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    {bio && (
                      <p className="text-sm text-gray-600">{bio}</p>
                    )}
                    {location && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {location}
                      </p>
                    )}
                    {!bio && !location && (
                      <p className="text-sm text-gray-400 italic">
                        You can add more details later from your profile page
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                  You can always update your profile information later
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full transition-all ${
            currentStep === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
          }`}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 1 && !canProceedFromStep1}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Creating profile..." : "Complete Setup"}
            {!loading && (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
