import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.90.13", "172.22.48.1"],
};

export default nextConfig;
