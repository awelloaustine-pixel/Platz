import type { Metadata, Viewport } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { site } from '@/content/site';
import { SceneMount } from '@/scene/SceneMount';
import { AppRuntime } from '@/ui/AppRuntime';
import { Backdrop } from '@/ui/Backdrop';
import { Hud } from '@/ui/Hud';
import './globals.css';

// next/font downloads these at build time and serves them from this site.
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-inter-tight',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description:
    'We build websites, automate your WhatsApp, and make sure AI recommends you — so customers find you first.',
};

export const viewport: Viewport = {
  themeColor: '#020617',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-KE" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <Backdrop />
        <SceneMount />
        <div aria-hidden="true" className="scene-shade" />
        <Hud />
        <main id="main">{children}</main>
        <AppRuntime />
      </body>
    </html>
  );
}
