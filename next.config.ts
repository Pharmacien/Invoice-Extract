import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to be proxied by the Studio UI
    // https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#allowedorigins
    // https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
    allowedRevalidateHosts: ['*.cloudworkstations.dev'],
    // This is required to allow the Next.js dev server to be proxied by the Studio UI
    // https://nextjs.org/docs/app/api-reference/next-config-js/rewrites
    rewrites: async () => [
      {
        // Route all of /__* to the Studio UI on port 6000
        source: '/__/:path*',
        destination: 'http://localhost:6000/__/:path*',
      },
    ],
  },
};

export default nextConfig;
