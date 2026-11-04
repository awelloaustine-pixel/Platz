// Picks the quality tier. These functions are pure so every rule is unit tested;
// the browser probing lives in lib/detectQuality.ts.

export type Tier = 'high' | 'medium' | 'lite';

export interface QualitySignals {
  webgl: boolean;
  mobile: boolean;
  saveData?: boolean;
  effectiveType?: string;
  /** GB, as reported by navigator.deviceMemory. Chrome only, capped at 8. */
  deviceMemory?: number;
  cores?: number;
  /** detect-gpu tier 0-3. Undefined when the GPU is unknown or detection failed. */
  gpuTier?: number;
}

const VERY_SLOW_NETWORKS = new Set(['slow-2g', '2g']);
const ORDER: readonly Tier[] = ['lite', 'medium', 'high'];

export function decideTier(signals: QualitySignals): { tier: Tier; reason: string } {
  const { webgl, mobile, saveData, effectiveType, deviceMemory, cores, gpuTier } = signals;

  if (!webgl) return { tier: 'lite', reason: 'webgl-unavailable' };
  if (saveData) return { tier: 'lite', reason: 'save-data' };
  // Chrome's estimate was seen reading "3g" on a fast laptop, so "3g" only counts on a phone,
  // where a heavy download is a real cost and a slow connection is much more likely.
  if (effectiveType && (VERY_SLOW_NETWORKS.has(effectiveType) || (mobile && effectiveType === '3g'))) {
    return { tier: 'lite', reason: 'slow-network' };
  }
  if (deviceMemory !== undefined && deviceMemory <= 2) return { tier: 'lite', reason: 'low-memory' };
  if (cores !== undefined && cores <= 2) return { tier: 'lite', reason: 'few-cores' };
  if (gpuTier === 0) return { tier: 'lite', reason: 'gpu-blocklisted' };
  if (mobile && gpuTier === 1) return { tier: 'lite', reason: 'weak-mobile-gpu' };
  if (mobile) return { tier: 'medium', reason: 'mobile' };
  if (gpuTier === undefined) return { tier: 'medium', reason: 'unknown-gpu' };
  if (gpuTier === 1) return { tier: 'medium', reason: 'weak-desktop-gpu' };
  if (deviceMemory !== undefined && deviceMemory < 4) return { tier: 'medium', reason: 'desktop-low-memory' };
  return { tier: 'high', reason: 'capable-desktop' };
}

export function lowerTier(tier: Tier): Tier {
  return ORDER[Math.max(ORDER.indexOf(tier) - 1, 0)];
}

function minTier(a: Tier, b: Tier): Tier {
  return ORDER[Math.min(ORDER.indexOf(a), ORDER.indexOf(b))];
}

export interface ResolveInput {
  autoTier: Tier;
  /** Ceiling set when the running scene cannot hold its frame rate. */
  runtimeCap: Tier | null;
  webgl: boolean;
  reducedMotion: boolean;
}

/** Combines detection and runtime performance into the tier to render. */
export function resolveTier({ autoTier, runtimeCap, webgl, reducedMotion }: ResolveInput): Tier {
  if (!webgl || reducedMotion) return 'lite';

  return runtimeCap ? minTier(autoTier, runtimeCap) : autoTier;
}

export function parseTierOverride(value: string | null): Tier | null {
  return value === 'high' || value === 'medium' || value === 'lite' ? value : null;
}
