/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generates a standalone production build optimized for Hostinger Node.js Application Manager
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

