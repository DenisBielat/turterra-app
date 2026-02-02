import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthModalProvider } from "@/components/auth/auth-modal-provider";

// Add Outfit font (Google Font)
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

// Add Averta font (Custom Font)
const averta = localFont({
  src: [
    {
      path: "./fonts/averta/averta-regular-webfont.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/averta/averta-regularitalic-webfont.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/averta/averta-semibold-webfont.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/averta/averta-bold-webfont.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-averta",
});

// Metadata for the app
export const metadata: Metadata = {
  title: "Turterra",
  description: "Learn about different turtle species.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="256x256" href="/images/turterra-favicon-256.png" />
      </head>
      <body className={`${outfit.variable} ${averta.variable} antialiased`} suppressHydrationWarning>
        <AuthModalProvider>
          {children}
        </AuthModalProvider>
      </body>
    </html>
  );
}
