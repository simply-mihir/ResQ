/** @type {import('next').NextConfig} */
const getUrl = (url, defaultUrl) => {
  const raw = url || defaultUrl;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
};

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/emergency/:path*',
        destination: `${getUrl(process.env.NEXT_PUBLIC_EMERGENCY_API_URL, 'http://localhost:4001')}/:path*`
      },
      {
        source: '/api/proxy/dispatch/:path*',
        destination: `${getUrl(process.env.NEXT_PUBLIC_DISPATCH_API_URL, 'http://localhost:4003')}/:path*`
      }
    ];
  }
};

export default nextConfig;
