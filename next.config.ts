import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Disable Turbopack for development due to Arabic path issues
    experimental: {
        // Use webpack instead of Turbopack for dev
    },
    turbopack: {
        // Set root to avoid path issues
        root: process.cwd(),
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.rodix.cloud',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '72.60.89.191',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
