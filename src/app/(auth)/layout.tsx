import Image from "next/image";
import Link from "next/link";

/**
 * Auth Layout
 *
 * Shared layout for all authentication pages (login, join, forgot-password, etc.)
 * Provides a centered card layout with the Turterra logo.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm flex flex-col">
      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Image
                src="/images/turterra-logo-green-text.png"
                alt="Turterra"
                width={150}
                height={40}
                className="h-auto w-auto"
                priority
              />
            </Link>
          </div>

          {/* Auth card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
