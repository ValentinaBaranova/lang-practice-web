import { DEFAULT_API_URL } from "./src/lib/api";
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_URL || DEFAULT_API_URL;
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
