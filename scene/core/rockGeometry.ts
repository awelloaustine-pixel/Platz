import { BufferGeometry, IcosahedronGeometry, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Tier } from '@/lib/quality';
import { seededRandom } from '@/lib/random';

function hash(x: number, y: number, z: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function noise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fade = (t: number) => t * t * (3 - 2 * t);
  const fx = fade(x - ix);
  const fy = fade(y - iy);
  const fz = fade(z - iz);
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  return mix(
    mix(mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), fx), mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), fx), fy),
    mix(
      mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), fx),
      mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), fx),
      fy,
    ),
    fz,
  );
}

/**
 * Sculpts a boulder from a sphere. Random cutting planes give the big flat fractured
 * faces, then layered noise breaks those faces up so they read as stone.
 */
export function createRockGeometry(seed: number, detail: number): BufferGeometry {
  const random = seededRandom(seed);
  const base = new IcosahedronGeometry(1, detail);
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const geometry = mergeVertices(base, 1e-4);
  base.dispose();

  const planes = Array.from({ length: 7 + Math.floor(random() * 4) }, () => {
    const normal = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
    return { normal, distance: 0.62 + random() * 0.26 };
  });
  const squash = new Vector3(0.82 + random() * 0.3, 0.72 + random() * 0.28, 0.8 + random() * 0.3);
  const offset = random() * 100;

  const position = geometry.getAttribute('position');
  const vertex = new Vector3();
  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);

    for (const plane of planes) {
      const excess = vertex.dot(plane.normal) - plane.distance;
      if (excess > 0) vertex.addScaledVector(plane.normal, -excess);
    }

    const sx = vertex.x + offset;
    const broad = noise3(sx * 1.6, vertex.y * 1.6, vertex.z * 1.6) - 0.5;
    const medium = noise3(sx * 4.2, vertex.y * 4.2, vertex.z * 4.2) - 0.5;
    const fine = noise3(sx * 10, vertex.y * 10, vertex.z * 10) - 0.5;
    vertex.multiplyScalar(1 + broad * 0.3 + medium * 0.11 + fine * 0.035);
    vertex.multiply(squash);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Mesh detail is the costliest number in the scene to raise: time grows with its square. The
 * material's shader supplies the fine surface, so these only need to carry the silhouette.
 */
export function rockSettings(tier: Tier): { detail: number; variants: number } {
  return tier === 'high' ? { detail: 22, variants: 3 } : { detail: 10, variants: 2 };
}

const seedFor = (variant: number) => 101 + variant * 37;
const cache = new Map<string, BufferGeometry>();

export function getRockGeometry(variant: number, detail: number): BufferGeometry {
  const key = `${variant}-${detail}`;
  let geometry = cache.get(key);
  if (!geometry) {
    geometry = createRockGeometry(seedFor(variant), detail);
    cache.set(key, geometry);
  }
  return geometry;
}

/** Sculpts the rocks one per slice of time, so that the page can respond in between. */
export async function prebuildRocks(tier: Tier, nextSlice: () => Promise<void>): Promise<void> {
  const { detail, variants } = rockSettings(tier);
  for (let variant = 0; variant < variants; variant += 1) {
    await nextSlice();
    getRockGeometry(variant, detail);
  }
}
