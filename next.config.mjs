/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", 
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
  // Server Actions are enabled by default in Next.js 14+. 
  // Only include this if you are on an older version of Next.js 13.
  /* experimental: {
    serverActions: true, 
  },
  */
};

export default nextConfig;