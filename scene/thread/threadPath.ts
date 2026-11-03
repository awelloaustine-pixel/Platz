import type { ThreadState, Vec3 } from '@/timeline/chapters';

export type BeamGroup = 'main' | 'cross' | 'splinter' | 'lanes' | 'loop';

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
];

/** How strongly each group of beams shows in each story state. */
export const THREAD_WEIGHTS: Record<ThreadState, Record<BeamGroup, number>> = {
  crossing: { main: 1, cross: 1, splinter: 0, lanes: 0, loop: 0 },
  splintered: { main: 0.25, cross: 0, splinter: 1, lanes: 0, loop: 0 },
  lanes: { main: 0.7, cross: 0, splinter: 0, lanes: 1, loop: 0 },
  riding: { main: 1, cross: 0.5, splinter: 0, lanes: 0, loop: 0 },
  orbit: { main: 0.45, cross: 0, splinter: 0, lanes: 0, loop: 1 },
  flowing: { main: 1, cross: 0, splinter: 0, lanes: 0, loop: 0.4 },
  loop: { main: 0.15, cross: 0, splinter: 0, lanes: 0, loop: 1 },
  resting: { main: 0.12, cross: 0, splinter: 0, lanes: 0, loop: 0.6 },
};
