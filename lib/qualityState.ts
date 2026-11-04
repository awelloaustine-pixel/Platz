'use client';

import { ui } from '@/timeline/store';
import { detectQuality } from './detectQuality';
import { lowerTier, parseTierOverride, resolveTier, type Tier, type TierPreference } from './quality';
import { readStored, writeStored } from './storage';

const PREFERENCE_KEY = 'platinum.view';
const FIRST_IMPRESSION_MS = 1200;

/** `?quality=lite|medium|high` pins a tier for testing and disables automatic downgrades. */
let override: Tier | null = null;
let started = false;
let detectionReason = 'not-detected';

function applyTier(): void {
  const { autoTier, preference, runtimeCap, webgl, reducedMotion } = ui.get();
  if (!autoTier) return;
  const resolved = resolveTier({ autoTier, preference, runtimeCap, webgl, reducedMotion });
  const tier = override && webgl ? override : resolved;
  ui.set({ tier });
  // Inspectable on a real phone: shows which tier was chosen and what detection found.
  document.documentElement.dataset.quality = tier;
  document.documentElement.dataset.qualityReason = detectionReason;
}

/** Building the scene blocks the browser briefly, so it waits until the page is settled. */
function afterFirstImpression(): Promise<void> {
  const wait = Math.max(FIRST_IMPRESSION_MS - performance.now(), 0);
  return new Promise((resolve) => {
    setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 800 });
      else resolve();
    }, wait);
  });
}

/** Runs after the page has loaded so that detection never competes with first paint. */
export async function initQuality(): Promise<void> {
  if (started) return;
  started = true;

  const stored = readStored(PREFERENCE_KEY);
  const preference: TierPreference = stored === 'simple' || stored === 'full' ? stored : 'auto';
  override = parseTierOverride(new URLSearchParams(window.location.search).get('quality'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ui.set({ preference, reducedMotion });

  if (document.readyState !== 'complete') {
    await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  }

  await afterFirstImpression();

  // Remembered Simple view needs no probing at all, and no GPU benchmark download.
  if (preference === 'simple' && !override) {
    ui.set({ autoTier: 'lite' });
    applyTier();
    return;
  }

  const detected = await detectQuality();
  detectionReason = detected.reason;
  ui.set({ autoTier: detected.autoTier, webgl: detected.webgl });
  applyTier();
}

/** The HUD button: flips between the fast version and the 3D version of the same page. */
export async function toggleSimpleView(): Promise<void> {
  const leavingSimple = ui.get().tier === 'lite';
  const preference: TierPreference = leavingSimple ? 'full' : 'simple';
  writeStored(PREFERENCE_KEY, preference);
  ui.set({ preference });
  override = null;

  // A visit that began in remembered Simple view skipped detection, so run it now.
  if (leavingSimple && ui.get().autoTier === 'lite') {
    const detected = await detectQuality();
    detectionReason = detected.reason;
    ui.set({ autoTier: detected.autoTier, webgl: detected.webgl });
  }
  applyTier();
}

/** Phones drop WebGL under memory pressure. Treat it as unavailable rather than retrying. */
export function reportContextLost(): void {
  ui.set({ webgl: false });
  applyTier();
}

/** Called when the running scene cannot hold its frame rate. Only ever steps down. */
export function reportFrameRateDecline(): void {
  const { tier } = ui.get();
  if (!tier || override) return;
  ui.set({ runtimeCap: lowerTier(tier) });
  applyTier();
}
