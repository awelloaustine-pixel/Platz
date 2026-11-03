'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/content/site';
import { formatChapter, getWorld } from '@/timeline/chapters';
import { useUi } from '@/timeline/store';
import { ChapterIndex } from './ChapterIndex';
import { HudReadouts } from './HudReadouts';
import { Nav } from './Nav';
import { ProgressRail } from './ProgressRail';
import { SoundToggle } from './SoundToggle';
import { WhatsAppButton } from './WhatsAppButton';

function ChapterCounter() {
  const pathname = usePathname();
  const active = useUi((state) => state.chapterIndex);
  const total = getWorld(pathname).chapters.length;

  return (
    <p className="hud-text flex overflow-hidden text-white" aria-label={`Chapter ${active + 1} of ${total}`}>
      <span key={active} className="counter-roll tabular-nums">
        {formatChapter(active)}
      </span>
      <span className="text-white/70">&nbsp;/ {formatChapter(total)}</span>
    </p>
  );
}

export function Hud() {
  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-start gap-3 px-4 pt-3 lg:px-10 lg:pt-6 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <Link href="/" aria-label={`${site.name} home`} className="flex min-h-11 items-center gap-2.5 justify-self-start lg:min-h-6">
          <Image src="/logo.svg" alt="" width={28} height={28} unoptimized priority />
          <span className="hidden text-sm tracking-wide text-white sm:inline">{site.shortName}</span>
        </Link>

        <div className="flex min-h-11 items-center lg:min-h-6">
          <ChapterCounter />
        </div>

        <div className="flex flex-col items-end gap-3 justify-self-end">
          <Nav />
          <div className="hidden lg:block">
            <SoundToggle />
          </div>
          <ChapterIndex />
        </div>
      </header>

      <ProgressRail />
      <WhatsAppButton />
      <HudReadouts />
    </>
  );
}
