import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // Old chapter pages and the Lab live on the single page now (PLAN.md 4.1). /lab keeps its query
  // and goes to `/` without a hash, so the playground reads the query and scrolls itself.
  redirects() {
    return [
      { source: '/learn', destination: '/', permanent: true },
      { source: '/learn/number-systems', destination: '/#binary', permanent: true },
      { source: '/learn/binary-fractions', destination: '/#encode', permanent: true },
      { source: '/learn/ieee-754', destination: '/#ieee754', permanent: true },
      { source: '/learn/add-sub', destination: '/#fp-add', permanent: true },
      { source: '/learn/mul-div', destination: '/', permanent: true },
      { source: '/lab', destination: '/', permanent: true },
    ];
  },
  // No X-Frame-Options on purpose: instructors may embed pages in an LMS iframe (PLAN.md 3.2).
  headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
