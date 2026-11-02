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
  // Stage 1 links (shared in LINE, Lab share links) keep working; the query string is carried over.
  redirects() {
    return [
      { source: '/learn', destination: '/floating-point', permanent: true },
      { source: '/learn/:slug', destination: '/floating-point/:slug', permanent: true },
      { source: '/lab', destination: '/floating-point/lab', permanent: true },
    ];
  },
  // No X-Frame-Options on purpose: instructors may embed pages in an LMS iframe (docs/plans/stage1-floating-point.md 3.2).
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
