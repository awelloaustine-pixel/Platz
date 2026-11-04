import { CatmullRomCurve3, Vector3 } from 'three';
import type { ThreadState, Vec3 } from '@/timeline/chapters';

export type BeamGroup =
  | 'main'
  | 'cross'
  | 'splinter'
  | 'lanes'
  | 'loop'
  | 'coil'
  | 'parallel'
  | 'merged'
  | 'answer'
  | 'team'
  | 'stream';

export interface BeamDefinition {
  group: BeamGroup;
  points: readonly Vec3[];
  radius: number;
  closed?: boolean;
  broken?: boolean;
}

function ring(radius: number, tilt: number, wobble: number): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2;
    const height = Math.sin(angle * 3) * wobble;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push([x, y * Math.cos(tilt) - height * Math.sin(tilt), y * Math.sin(tilt) + height * Math.cos(tilt)]);
  }
  return points;
}

/** The thread coming to rest: a spiral winding gently into the Core. */
function coil(): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i <= 28; i += 1) {
    const t = i / 28;
    const angle = t * Math.PI * 7;
    const radius = 9 * (1 - t) + 0.2;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius * 0.9, 0.5 + t * 0.1]);
  }
  return points;
}

/** The customer's journey. Every beam starts from, or passes through, the hub at the origin. */
export const BEAMS: readonly BeamDefinition[] = [
  {
    group: 'main',
    radius: 0.05,
    points: [
      // Arrives from the upper left, so it stays clear of the headline's bottom-left corner.
      [-40, 24, -12],
      [-20, 11, -4],
      [-8, 3.4, 0],
      [-3, 0.7, 0.5],
      [0, 0, 0.6],
      [8, -0.15, 0.3],
      [18, -1.4, -3],
      [28, 3.5, -14],
      [34, 16, -34],
    ],
  },
  {
    group: 'cross',
    radius: 0.04,
    points: [
      [0, -13, 0.5],
      [0, -5, 0.6],
      [0, 0, 0.6],
      [0, 5, 0.6],
      [0, 13, 0.5],
    ],
  },
  {
    group: 'splinter',
    radius: 0.038,
    broken: true,
    points: [
      [0, 0, 0.6],
      [3.2, 1.3, 1.4],
      [7, 3.6, 0],
      [11, 7.5, -4],
    ],
  },
  {
    group: 'splinter',
    radius: 0.038,
    broken: true,
    points: [
      [0, 0, 0.6],
      [3.6, -0.5, 1.8],
      [8, -1.5, 1],
      [13, -1, -3],
    ],
  },
  {
    group: 'splinter',
    radius: 0.038,
    broken: true,
    points: [
      [0, 0, 0.6],
      [2.2, -2.2, 1.2],
      [4.6, -5.6, -0.4],
      [6.5, -10, -4],
    ],
  },
  {
    group: 'lanes',
    radius: 0.04,
    points: [
      [0, 0, 0.6],
      [-2.2, 1.4, 2.2],
      [-6, 3.2, 3],
      [-13, 4.5, 0],
    ],
  },
  {
    group: 'lanes',
    radius: 0.04,
    points: [
      [0, 0, 0.6],
      [0.4, 0.2, 3],
      [1, 0.5, 6],
      [2, 0.8, 11],
    ],
  },
  {
    group: 'lanes',
    radius: 0.04,
    points: [
      [0, 0, 0.6],
      [2.4, -1.4, 2.2],
      [6.5, -3, 3],
      [14, -4, 0],
    ],
  },
  { group: 'loop', radius: 0.05, closed: true, points: ring(5.5, 0.55, 0.35) },
  { group: 'coil', radius: 0.04, points: coil() },
  // Pricing: three straight lanes running into the distance.
  ...[-9, 0, 9].map(
    (x): BeamDefinition => ({
      group: 'parallel',
      radius: 0.05,
      points: [
        [x, -3.6, 18],
        [x, -3.6, 4],
        [x, -3.4, -10],
        [x * 0.9, -2.6, -32],
      ],
    }),
  ),
  // Pricing: the same three lanes merging into one beam at the distant Core.
  ...[-9, 0, 9].map(
    (x): BeamDefinition => ({
      group: 'merged',
      radius: 0.05,
      points: [
        [x, -3.6, 18],
        [x * 0.8, -3, 2],
        [x * 0.25, -1.4, -14],
        [0, 0, -30],
      ],
    }),
  ),
  // The Oracle's answer: from the orb to the pin marked Your Business.
  {
    group: 'answer',
    radius: 0.045,
    points: [
      [0, 0.2, 0],
      [1.4, 0.4, 0.9],
      [2.6, -0.6, 1.5],
      [2.8, -2.2, 1.5],
    ],
  },
  // The team: the thread joins the four nodes to the Core.
  ...[
    [-4.4, 3, 0.6],
    [4.4, 3, 0.6],
    [4.4, -3, 0.6],
    [-4.4, -3, 0.6],
  ].map(
    ([x, y, z]): BeamDefinition => ({
      group: 'team',
      radius: 0.03,
      points: [
        [0, 0, 0.6],
        [x * 0.4, y * 0.62, z + 0.4],
        [x, y, z],
      ],
    }),
  ),
  { group: 'team', radius: 0.022, closed: true, points: [[-4.4, 3, 0.6], [4.4, 3, 0.6], [4.4, -3, 0.6], [-4.4, -3, 0.6]] },
  // The blueprint: a thread drawn across the page to the contact button.
  {
    group: 'stream',
    radius: 0.035,
    points: [
      [-16, -6, -3],
      [-8, -5.2, 0],
      [-1, -3.8, 0.4],
      [2.6, 0.6, 0.3],
    ],
  },
];

/** The main thread as a curve, so other parts of the scene can sit exactly on it. */
export function threadCurve(): CatmullRomCurve3 {
  const main = BEAMS.find((beam) => beam.group === 'main');
  return new CatmullRomCurve3((main?.points ?? []).map(([x, y, z]) => new Vector3(x, y, z)));
}

const NONE: Record<BeamGroup, number> = {
  main: 0,
  cross: 0,
  splinter: 0,
  lanes: 0,
  loop: 0,
  coil: 0,
  parallel: 0,
  merged: 0,
  answer: 0,
  team: 0,
  stream: 0,
};

/** How strongly each group of beams shows in each story state. */
export const THREAD_WEIGHTS: Record<ThreadState, Record<BeamGroup, number>> = {
  crossing: { ...NONE, main: 1, cross: 1 },
  splintered: { ...NONE, main: 0.25, splinter: 1 },
  lanes: { ...NONE, main: 0.7, lanes: 1 },
  riding: { ...NONE, main: 1, cross: 0.5 },
  orbit: { ...NONE, main: 0.45, loop: 1 },
  flowing: { ...NONE, main: 1, loop: 0.4 },
  loop: { ...NONE, main: 0.15, loop: 1 },
  resting: { ...NONE, coil: 0.5 },
  blueprint: { ...NONE, stream: 1 },
  silent: NONE,
  answer: { ...NONE, answer: 1 },
  parallel: { ...NONE, parallel: 1 },
  merged: { ...NONE, merged: 1 },
  team: { ...NONE, team: 1 },
};
