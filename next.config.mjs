/** @type {import('next').NextConfig} */
const nextConfig = {
  // NO usar output: 'export' - el admin necesita SSR
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
