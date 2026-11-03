import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideTier, lowerTier, parseTierOverride, resolveTier } from './quality.ts';

const desktop = { webgl: true, mobile: false, deviceMemory: 8, cores: 8, gpuTier: 3 };
const phone = { webgl: true, mobile: true, deviceMemory: 4, cores: 8, gpuTier: 2, effectiveType: '4g' };

test('a capable desktop gets the high tier', () => {
  assert.equal(decideTier(desktop).tier, 'high');
});

test('a good phone gets the medium tier', () => {
  assert.equal(decideTier(phone).tier, 'medium');
});

test('each slow-device signal forces lite on its own', () => {
  const cases = [
    [{ webgl: false }, 'webgl-unavailable'],
    [{ saveData: true }, 'save-data'],
    [{ effectiveType: '3g' }, 'slow-network'],
    [{ effectiveType: 'slow-2g' }, 'slow-network'],
    [{ deviceMemory: 2 }, 'low-memory'],
    [{ cores: 2 }, 'few-cores'],
    [{ gpuTier: 0 }, 'gpu-blocklisted'],
    [{ gpuTier: 1 }, 'weak-mobile-gpu'],
  ] as const;
  for (const [override, reason] of cases) {
    assert.deepEqual(decideTier({ ...phone, ...override }), { tier: 'lite', reason });
  }
});

test('an unknown GPU does not push a phone to lite', () => {
  assert.equal(decideTier({ ...phone, gpuTier: undefined }).tier, 'medium');
});

test('browsers that hide memory and network info are not penalised', () => {
  assert.equal(decideTier({ webgl: true, mobile: false, gpuTier: 3 }).tier, 'high');
  assert.equal(decideTier({ webgl: true, mobile: true, gpuTier: 3 }).tier, 'medium');
});

test('a desktop only gets high with a known, capable GPU', () => {
  assert.equal(decideTier({ ...desktop, gpuTier: undefined }).tier, 'medium');
  assert.equal(decideTier({ ...desktop, gpuTier: 1 }).tier, 'medium');
  assert.equal(decideTier({ ...desktop, deviceMemory: 3 }).tier, 'medium');
});

const base = { autoTier: 'high', preference: 'auto', runtimeCap: null, webgl: true, reducedMotion: false } as const;

test('Simple view and reduced motion always win', () => {
  assert.equal(resolveTier({ ...base, preference: 'simple' }), 'lite');
  assert.equal(resolveTier({ ...base, reducedMotion: true }), 'lite');
  assert.equal(resolveTier({ ...base, preference: 'full', reducedMotion: true }), 'lite');
});

test('the runtime cap lowers the tier but never raises it', () => {
  assert.equal(resolveTier({ ...base, runtimeCap: 'medium' }), 'medium');
  assert.equal(resolveTier({ ...base, autoTier: 'medium', runtimeCap: 'high' }), 'medium');
  assert.equal(resolveTier({ ...base, autoTier: 'medium', runtimeCap: 'lite' }), 'lite');
});

test('choosing full 3D lifts lite to medium unless WebGL is missing', () => {
  assert.equal(resolveTier({ ...base, autoTier: 'lite', preference: 'full' }), 'medium');
  assert.equal(resolveTier({ ...base, runtimeCap: 'lite', preference: 'full' }), 'medium');
  assert.equal(resolveTier({ ...base, autoTier: 'lite', preference: 'full', webgl: false }), 'lite');
});

test('lowerTier stops at lite', () => {
  assert.equal(lowerTier('high'), 'medium');
  assert.equal(lowerTier('medium'), 'lite');
  assert.equal(lowerTier('lite'), 'lite');
});

test('parseTierOverride only accepts real tiers', () => {
  assert.equal(parseTierOverride('medium'), 'medium');
  assert.equal(parseTierOverride('ultra'), null);
  assert.equal(parseTierOverride(null), null);
});
