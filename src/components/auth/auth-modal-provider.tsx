"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { ForgotPasswordForm } from "./forgot-password-form";

type AuthModalType = "login" | "join" | "forgot-password" | null;

interface AuthModalContextType {
  openModal: (type: AuthModalType) => void;
  closeModal: () => void;
  modalType: AuthModalType;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [modalType, setModalType] = useState<AuthModalType>(null);

  const openModal = useCallback((type: AuthModalType) => {
    setModalType(type);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (modalType) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [modalType, closeModal]);

  return (
    <AuthModalContext.Provider value={{ openModal, closeModal, modalType }}>
      {children}
      {modalType && <AuthModalContent type={modalType} onClose={closeModal} />}
    </AuthModalContext.Provider>
  );
}

function SocialLoginDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 text-gray-500">or</span>
      </div>
    </div>
  );
}

function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", "/");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-2 text-sm text-red-600 text-center">{error}</div>
      )}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="font-medium">
          {loading ? "Connecting..." : "Continue with Google"}
        </span>
      </button>
    </div>
  );
}

function AuthModalContent({
  type,
  onClose,
}: {
  type: AuthModalType;
  onClose: () => void;
}) {
  const { openModal } = useAuthModal();
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop - click to close */}
      <div
        className="absolute inset-0 bg-green-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
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
            onClick={onClose}
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
            <Link href="/" onClick={onClose}>
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
          {type === "login" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600">Log in to your Turterra account</p>
              </div>
              <LoginForm />
              <SocialLoginDivider />
              <GoogleSignInButton />
              <p className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => openModal("join")}
                  className="font-semibold text-green-700 hover:text-green-900 transition-colors"
                >
                  Join the Community
                </button>
              </p>
            </>
          )}

          {type === "join" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
                  Join the Community
                </h1>
                <p className="text-gray-600">
                  Create your Turterra account to get started
                </p>
              </div>
              <SignupForm />
              <SocialLoginDivider />
              <GoogleSignInButton />
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => openModal("login")}
                  className="font-semibold text-green-700 hover:text-green-900 transition-colors"
                >
                  Log in
                </button>
              </p>
            </>
          )}

          {type === "forgot-password" && (
            <>
              {!forgotPasswordSuccess && (
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
                    Reset Password
                  </h1>
                  <p className="text-gray-600">
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                </div>
              )}
              <ForgotPasswordForm onSuccess={() => setForgotPasswordSuccess(true)} />
              <p className="mt-6 text-center text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  onClick={() => openModal("login")}
                  className="font-semibold text-green-700 hover:text-green-900 transition-colors"
                >
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
