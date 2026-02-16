import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import Link from "next/link";

export const metadata = {
  title: "Log In | Turterra",
  description: "Log in to your Turterra account",
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-green-950 font-heading mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600">Log in to your Turterra account</p>
      </div>

      <LoginForm />

      {/* Social login divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">or</span>
        </div>
      </div>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/join"
          className="font-semibold text-green-700 hover:text-green-900 transition-colors"
        >
          Join the Community
        </Link>
      </p>
    </>
  );
}
