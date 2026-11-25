/** @type {import('next').NextConfig} */
const apiTarget =
  process.env.RAKSHA_API_PROXY_TARGET || "http://127.0.0.1:8787";

const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
