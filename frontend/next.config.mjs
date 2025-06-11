/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force dynamic rendering for all pages during build to avoid SSR issues with auth context
  experimental: {
    forceSwcTransforms: true,
  },// Configure allowed image domains
  images: {
    domains: ['images.unsplash.com', 'unsplash.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  webpack: (config, { isServer }) => {
    // Handle TensorFlow.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    
    return config
  },
  // Enable static file serving for model files
  async headers() {
    return [
      {
        source: '/model/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Add API routes proxy for backend communication, but exclude NextAuth routes
  async rewrites() {
    return [      {
        source: '/api/waste-banks/:path*',
        destination: 'http://localhost:3001/api/waste-banks/:path*',
      },
      {
        source: '/api/payment/:path*',
        destination: 'http://localhost:3001/api/payment/:path*',
      },
      {
        source: '/api/articles/:path*',
        destination: 'http://localhost:3001/api/articles/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:3001/api/admin/:path*',
      },
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:3001/api/users/:path*',
      }
    ]
  }
}

export default nextConfig