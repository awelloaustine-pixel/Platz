import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The stylesheet arrives with the page, saving a round trip before first paint on slow networks.
  experimental: { inlineCss: true },
};

export default config;
