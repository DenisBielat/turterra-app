import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'nznxvfsdsxeflwzlrpvj.supabase.co',
      }
    ]
  }
};

export default nextConfig;
