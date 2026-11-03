'use client';

import { readStored, writeStored } from '@/lib/storage';
import { ui, useUi } from '@/timeline/store';

const SOUND_KEY = 'platinum.sound';

export function hydrateSound(): void {
  ui.set({ soundOn: readStored(SOUND_KEY) === 'on' });
}

/** Holds the remembered preference. The Howler ambient bed attaches to soundOn in a later step. */
export function SoundToggle() {
  const soundOn = useUi((state) => state.soundOn);

  return (
    <button
      type="button"
      aria-pressed={soundOn}
      onClick={() => {
        const next = !soundOn;
        writeStored(SOUND_KEY, next ? 'on' : 'off');
        ui.set({ soundOn: next });
      }}
      className="hud-text min-h-6 text-white/70 transition-colors hover:text-white"
    >
      Sound {soundOn ? 'on' : 'off'}
    </button>
  );
}
