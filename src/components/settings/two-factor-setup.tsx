"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TwoFactorSetupProps {
  isEnabled: boolean;
}

// Shield icon for 2FA status
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

export function TwoFactorSetup({ isEnabled }: TwoFactorSetupProps) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "disable">("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("setup");
    }

    setLoading(false);
  };

  const verifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!factorId) {
      setError("2FA setup error. Please start over.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const currentFactorId = factorId;

    // Create a challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: currentFactorId!,
    });

    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    // Verify the code
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: currentFactorId!,
      challengeId: challengeData.id,
      code: verificationCode,
    });

    if (verifyError) {
      setError("Invalid code. Please check your authenticator app and try again.");
      setLoading(false);
      return;
    }

    // Reset state and refresh
    setStep("idle");
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setVerificationCode("");
    router.refresh();
    setLoading(false);
  };

  const startDisable = () => {
    setError(null);
    setStep("disable");
  };

  const disable2FA = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const totpFactor = factorsData?.totp?.find((f) => f.status === "verified");

    if (!totpFactor) {
      setError("No active 2FA found.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.mfa.unenroll({
      factorId: totpFactor.id,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setStep("idle");
    router.refresh();
    setLoading(false);
  };

  const cancelSetup = async () => {
    // If we have an unverified factor, remove it
    if (factorId) {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId });
    }

    setStep("idle");
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setVerificationCode("");
    setError(null);
  };

  // Setup step - show QR code
  if (step === "setup" && qrCode) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-green-950 mb-2">
            Set Up Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-500">
            Scan the QR code below with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
            Can&apos;t scan? Enter code manually
          </summary>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Secret key:</p>
            <code className="text-sm font-mono text-green-950 break-all select-all">
              {secret}
            </code>
          </div>
        </details>

        <form onSubmit={verifyAndEnable} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-green-950"
            >
              Enter the 6-digit code from your app
            </label>
            <input
              id="verificationCode"
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={cancelSetup}
              disabled={loading}
              className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 py-2.5 px-4 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Verifying..." : "Enable 2FA"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Disable confirmation step
  if (step === "disable") {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-green-950 mb-2">
            Disable Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-500">
            This will remove the extra layer of security from your account. Are you sure you want to continue?
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="text-sm text-orange-700">
              <p className="font-medium">Warning</p>
              <p>Without 2FA, your account will only be protected by your password.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep("idle")}
            disabled={loading}
            className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Keep Enabled
          </button>
          <button
            type="button"
            onClick={disable2FA}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-red-600 text-white text-sm font-semibold rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Disabling..." : "Disable 2FA"}
          </button>
        </div>
      </div>
    );
  }

  // Default idle state - show status and enable/disable button
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isEnabled ? "bg-green-50" : "bg-gray-100"}`}>
          <ShieldIcon className={`w-5 h-5 ${isEnabled ? "text-green-600" : "text-gray-400"}`} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-green-950">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEnabled
              ? "Your account is protected with an authenticator app."
              : "Add an extra layer of security using an authenticator app."}
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>

      {isEnabled ? (
        <button
          onClick={startDisable}
          disabled={loading}
          className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          Disable
        </button>
      ) : (
        <button
          onClick={startSetup}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          {loading ? "Loading..." : "Enable"}
        </button>
      )}
    </div>
  );
}
