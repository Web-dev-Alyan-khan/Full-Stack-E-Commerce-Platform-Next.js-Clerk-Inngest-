/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // ✅ FIX (must start with /)
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**", // ✅ FIX
      },
    ],
  },

  experimental: {
    serverActions: true, // 🚀 good for modern Next.js
  },
};

export default nextConfig;