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
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { GoogleSignInButton } from "./google-sign-in-button";

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
