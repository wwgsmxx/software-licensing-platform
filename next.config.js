/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  // Allow images from any source (for educational demo)
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
