/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'sharp'],
  },
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
