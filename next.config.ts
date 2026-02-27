/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'ALLOWALL',
        },
      ],
    },
  ],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
