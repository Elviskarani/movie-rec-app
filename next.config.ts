import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    // Set to true in dev to avoid optimizer fetch timeouts (use .env.local: NEXT_IMAGE_UNOPTIMIZED=true)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",  },
};

export default nextConfig;
