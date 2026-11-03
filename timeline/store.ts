'use client';

import { useSyncExternalStore } from 'react';
import type { Tier, TierPreference } from '@/lib/quality';

/**
 * The master value everything reads. Written once per frame by the scrubbed GSAP
 * timeline and read inside useFrame or via subscribeMaster, so it bypasses React.
 */
export const master = {
  /** 0..1 over the whole page. */
  progress: 0,
  /** Fractional chapter: 2.5 is halfway between chapters 2 and 3. */
  chapter: 0,
};

const masterListeners = new Set<() => void>();

export function subscribeMaster(listener: () => void): () => void {
  masterListeners.add(listener);
  return () => masterListeners.delete(listener);
}

export function emitMaster(): void {
  masterListeners.forEach((listener) => listener());
}

/** Discrete state for the DOM. Holds primitives only, so changes are cheap to compare. */
export interface UiState {
  chapterIndex: number;
  petalsLit: number;
  leadsCaptured: number;
  /** null until detection has finished. */
  tier: Tier | null;
  autoTier: Tier | null;
  runtimeCap: Tier | null;
  preference: TierPreference;
  webgl: boolean;
  reducedMotion: boolean;
  soundOn: boolean;
}

const initialState: UiState = {
  chapterIndex: 0,
  petalsLit: 0,
  leadsCaptured: 0,
  tier: null,
  autoTier: null,
  runtimeCap: null,
  preference: 'auto',
  webgl: true,
  reducedMotion: false,
  soundOn: false,
};

let state = initialState;
const listeners = new Set<() => void>();

export const ui = {
  get: () => state,
  set(partial: Partial<UiState>) {
    const keys = Object.keys(partial) as (keyof UiState)[];
    if (keys.every((key) => state[key] === partial[key])) return;
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useUi<T>(selector: (current: UiState) => T): T {
  return useSyncExternalStore(
    ui.subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}
