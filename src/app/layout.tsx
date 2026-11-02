import { ZOOM_BOOT } from '@/components/layout/zoom-control';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, IBM_Plex_Sans_Thai, JetBrains_Mono } from 'next/font/google';
import { GlassPointer } from '@/components/glass/glass-pointer';
import { LiquidBackground } from '@/components/glass/liquid-background';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { MotionProvider } from '@/components/ui/motion-provider';
import { site } from '@/lib/site';
import './globals.css';

const chakraPetch = Chakra_Petch({
  variable: '--font-chakra-petch',
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

const plexSansThai = IBM_Plex_Sans_Thai({
  variable: '--font-plex-sans-thai',
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

// latin only: JetBrains Mono has no thai subset
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  themeColor: '#ECF5FF',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      // the zoom boot script may set style.zoom before React hydrates
      suppressHydrationWarning
      lang="th"
      data-theme="comkrub"
      className={`${chakraPetch.variable} ${plexSansThai.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: ZOOM_BOOT }} />
        <MotionProvider>
          <LiquidBackground />
          <GlassPointer />
          <a
            href="#main"
            className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            ข้ามไปที่เนื้อหา
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </MotionProvider>
        {/* only on Vercel builds: elsewhere the /_vercel/insights script does not exist */}
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  );
}
