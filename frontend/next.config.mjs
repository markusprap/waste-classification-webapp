/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    // Pastikan backendUrl diawali http(s):// agar rewrites valid di Vercel
    return [
      { source: '/api/waste-banks/:path*', destination: `${backendUrl}/api/waste-banks/:path*` },
      { source: '/api/payment/:path*', destination: `${backendUrl}/api/payment/:path*` },
      { source: '/api/articles/:path*', destination: `${backendUrl}/api/articles/:path*` },
      { source: '/api/admin/:path*', destination: `${backendUrl}/api/admin/:path*` },
      { source: '/api/users/:path*', destination: `${backendUrl}/api/users/:path*` },
    ];
  },
};

export default nextConfig;
