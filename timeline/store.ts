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
  litCount: number;
  /** null until detection has finished. */
  tier: Tier | null;
  autoTier: Tier | null;
  runtimeCap: Tier | null;
  preference: TierPreference;
  webgl: boolean;
  reducedMotion: boolean;
  soundOn: boolean;
  /** The service card being hovered in What We Do, or -1. */
  laneFocus: number;
  /** The pricing tier being hovered (0-2), or -1. */
  tierLevel: number;
  /** The item a StepList is on, which its world lights to match. */
  worldFocus: number;
  /** The Oracle demo's current question, echoed inside the orb. */
  oracleQuestion: string;
  /** Goes up by one each time a lead is sent, which fires the thread's pulse. */
  leadPulse: number;
}

const initialState: UiState = {
  chapterIndex: 0,
  litCount: 0,
  tier: null,
  autoTier: null,
  runtimeCap: null,
  preference: 'auto',
  webgl: true,
  reducedMotion: false,
  soundOn: false,
  laneFocus: -1,
  tierLevel: -1,
  worldFocus: 0,
  oracleQuestion: '',
  leadPulse: 0,
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
