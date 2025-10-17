import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'nznxvfsdsxeflwzlrpvj.supabase.co']
  },
  experimental: {
    typedRoutes: false
  }
};

export default nextConfig;
