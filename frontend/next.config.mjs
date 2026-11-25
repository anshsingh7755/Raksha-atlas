/** @type {import('next').NextConfig} */
const nodeApiTarget =
  process.env.RAKSHA_API_PROXY_TARGET || "http://127.0.0.1:8787";
const springApiTarget =
  process.env.RAKSHA_SPRING_API_PROXY_TARGET || "http://127.0.0.1:8081";
const springApiEnabled = process.env.RAKSHA_SPRING_API_ENABLED === "true";

const springRoutes = [
  "/api/inventory",
  "/api/inventory/:path*",
  "/api/sources",
  "/api/programmes",
  "/api/procurement-2026",
  "/api/chat",
];

const nextConfig = {
  output: "standalone",
  async rewrites() {
    return {
      beforeFiles: springApiEnabled
        ? springRoutes.map((source) => ({
            source,
            destination: `${springApiTarget}${source}`,
          }))
        : [],
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${nodeApiTarget}/api/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
