'use client';

import { decideTier, type QualitySignals, type Tier } from './quality';

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

type ExtendedNavigator = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
  userAgentData?: { mobile?: boolean };
};

const GPU_DETECTION_TIMEOUT_MS = 2500;

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

function isMobile(nav: ExtendedNavigator): boolean {
  return nav.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod|Mobi/i.test(nav.userAgent);
}

/** Resolves undefined when the GPU is unknown, so a slow lookup can never hold up the page. */
async function detectGpuTier(): Promise<number | undefined> {
  const lookup = import('detect-gpu')
    .then(({ getGPUTier }) => getGPUTier({ benchmarksURL: '/benchmarks' }))
    // Only a benchmark match or a blocklist hit says anything about the GPU. Other results
    // mean it is unlisted or its probe context failed, which is unknown rather than weak.
    .then((result) => (result.type === 'BENCHMARK' || result.type === 'BLOCKLISTED' ? result.tier : undefined))
    .catch(() => undefined);
  const timeout = new Promise<undefined>((resolve) => setTimeout(resolve, GPU_DETECTION_TIMEOUT_MS));
  return Promise.race([lookup, timeout]);
}

export interface DetectedQuality {
  autoTier: Tier;
  webgl: boolean;
  reason: string;
}

export async function detectQuality(): Promise<DetectedQuality> {
  const nav = navigator as ExtendedNavigator;
  const signals: QualitySignals = {
    webgl: hasWebGL(),
    mobile: isMobile(nav),
    saveData: nav.connection?.saveData,
    effectiveType: nav.connection?.effectiveType,
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency || undefined,
  };

  // Skip the GPU lookup and its download when the cheap signals already mean lite.
  const early = decideTier(signals);
  if (early.tier === 'lite') return { autoTier: 'lite', webgl: signals.webgl, reason: early.reason };

  const decided = decideTier({ ...signals, gpuTier: await detectGpuTier() });
  return { autoTier: decided.tier, webgl: signals.webgl, reason: decided.reason };
}
