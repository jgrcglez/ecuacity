import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.90.13", "172.22.48.1"],
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/logo.png",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
