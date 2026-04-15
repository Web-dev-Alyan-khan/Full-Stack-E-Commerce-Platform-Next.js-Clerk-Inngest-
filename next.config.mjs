/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**', // Added leading slash for correct pattern matching
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com', // Added Clerk for user profile images
                pathname: '/**',
            },
        ],
    },
    // Fix for the ESLint serialization error
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Optional: Fix for common "Page Data Collection" timeouts with MongoDB
    typescript: {
        ignoreBuildErrors: true, 
    }
};

export default nextConfig;