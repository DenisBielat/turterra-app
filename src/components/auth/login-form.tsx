"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthModal } from "./auth-modal-provider";

export function LoginForm() {
  const router = useRouter();
  const { openModal, closeModal } = useAuthModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Check if user has 2FA enabled
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = factorsData?.totp?.filter((f) => f.status === "verified") || [];

    if (verifiedFactors.length > 0) {
      // User has 2FA, need to verify
      setFactorId(verifiedFactors[0].id);
      setRequires2FA(true);
      setLoading(false);
      return;
    }

    // No 2FA, proceed to check profile and redirect
    await completeLogin(supabase);
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!factorId) {
      setError("2FA setup error. Please try logging in again.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Create challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    // Verify the code
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verificationCode,
    });

    if (verifyError) {
      setError("Invalid verification code. Please try again.");
      setLoading(false);
      return;
    }

    // 2FA verified, complete login
    await completeLogin(supabase);
  };

  const completeLogin = async (supabase: ReturnType<typeof createClient>) => {
    // Check if user has a profile
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // New user without profile - redirect to onboarding
        closeModal();
        router.push("/onboarding");
        return;
      }
    }

    // Existing user with profile - just refresh the page
    closeModal();
    router.refresh();
  };

  const resetToLogin = () => {
    setRequires2FA(false);
    setFactorId(null);
    setVerificationCode("");
    setError(null);
  };

  // 2FA verification form
  if (requires2FA) {
    return (
      <form onSubmit={handle2FAVerification} className="space-y-5">
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-green-950 font-heading">
            Two-Factor Authentication
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            autoComplete="one-time-code"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 text-center text-2xl font-mono tracking-widest placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || verificationCode.length !== 6}
          className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          type="button"
          onClick={resetToLogin}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back to login
        </button>
      </form>
    );
  }

  // Regular login form
  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-green-950"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="iliketurtles@email.com"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-green-950"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Your password"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-green-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => openModal("forgot-password")}
          className="text-sm text-green-700 hover:text-green-900 transition-colors"
        >
          Forgot your password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
