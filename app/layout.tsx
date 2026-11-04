import type { Metadata, Viewport } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { site } from '@/content/site';
import { SceneMount } from '@/scene/SceneMount';
import { localBusinessSchema, organizationSchema } from '@/lib/schema';
import { Analytics } from '@/ui/Analytics';
import { AppRuntime } from '@/ui/AppRuntime';
import { Backdrop } from '@/ui/Backdrop';
import { Cursor } from '@/ui/Cursor';
import { Hud } from '@/ui/Hud';
import { JsonLd } from '@/ui/JsonLd';
import { Loader } from '@/ui/Loader';
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
  preload: false,
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

// Runs before first paint. Without it (no JS) nothing is hidden, so every visitor gets the text.
const PRE_PAINT_SCRIPT = `(function(){var r=document.documentElement;r.classList.add('js');if(innerWidth>=1024)r.classList.add('jsr');try{var c=navigator.connection;if(sessionStorage.getItem('platinum.seen')||innerWidth<1024||(c&&(c.saveData||/2g|3g/.test(c.effectiveType||'')))||matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('seen')}sessionStorage.setItem('platinum.seen','1')}catch(e){r.classList.add('seen')}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-KE" className={`${interTight.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <Backdrop />
        <SceneMount />
        <div aria-hidden="true" className="scene-shade" />
        <Hud />
        <main id="main">{children}</main>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
        <Analytics />
        <Cursor />
        <Loader />
        <AppRuntime />
      </body>
    </html>
  );
}
