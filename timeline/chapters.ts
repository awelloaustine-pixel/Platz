// The single source of truth. The 3D scene and the DOM both read the same scroll
// value (master.chapter) and sample these configs, which keeps them in lockstep.

export type Vec3 = readonly [number, number, number];

export type ThreadState =
  | 'crossing'
  | 'splintered'
  | 'lanes'
  | 'riding'
  | 'orbit'
  | 'flowing'
  | 'loop'
  | 'resting';

export interface ChapterConfig {
  id: string;
  /** Chapter index entry, and shown as `01 —— label` above the headline after the hero. */
  label: string;
  title: string;
  /** Minimum section height in viewport heights. Sets how long the shot lasts. */
  span: number;
  camera: { position: Vec3; target: Vec3; fov: number };
  /** How many of the 12 stones have gold running through them. */
  lit: number;
  /** 0 = stones pulled in to one boulder, 1 = open in the full ring. */
  spread: number;
  /** 0 = in formation, 1 = scattered and flickering. */
  damage: number;
  /** Extra camera points on the way to the next chapter, for shots that follow a path. */
  ride?: readonly { position: Vec3; target: Vec3 }[];
  /** 1 = the gates along the thread are visible. */
  gates?: number;
  /** 0 opts out of the portrait phone framing adjustment. Defaults to 1. */
  framing?: number;
  /** glow = how strongly the accent colour fills the space around the Core. */
  grade: { background: string; fog: string; fogDensity: number; accent: string; glow: number };
  thread: ThreadState;
  /** Strength of the light where the thread meets the hub. */
  flare: number;
  /** Strength of the Nairobi skyline lights in the distance. */
  city: number;
  /** Running value of the LEADS CAPTURED readout when this shot is at rest. */
  leads: number;
}

export interface World {
  name: string;
  chapters: readonly ChapterConfig[];
}

const GOLD = '#D4A62A';
const HOT_GOLD = '#FFB52E';
const RED = '#FF2A1F';
const WHATSAPP = '#25D366';
const NAVY = '#020617';

const home: readonly ChapterConfig[] = [
  {
    id: 'arrival',
    label: 'Arrival',
    title: 'Your Business Deserves More Customers',
    span: 1.6,
    camera: { position: [-2.3, 0.2, 15], target: [-2.8, 0, 0], fov: 35 },
    lit: 0,
    spread: 0.72,
    damage: 0,
    grade: { background: NAVY, fog: '#050b1f', fogDensity: 0.012, accent: HOT_GOLD, glow: 0.3 },
    thread: 'crossing',
    flare: 1,
    city: 1,
    leads: 0,
  },
  {
    id: 'problem',
    label: 'The Problem',
    title: "Your Competitors Are Getting the Customers You're Missing",
    span: 2,
    camera: { position: [5, 1.6, 13], target: [-2.4, 0.8, 0], fov: 38 },
    lit: 0,
    spread: 0.8,
    damage: 1,
    grade: { background: '#0d0204', fog: '#1c0407', fogDensity: 0.022, accent: RED, glow: 0.75 },
    thread: 'splintered',
    flare: 0.5,
    city: 0,
    leads: 0,
  },
  {
    id: 'system',
    label: 'What We Do',
    title: 'One System. Three Ways to Win Customers.',
    span: 2,
    camera: { position: [-5, 2.6, 11], target: [-2, 0, 0], fov: 35 },
    lit: 1,
    spread: 0.18,
    damage: 0,
    grade: { background: '#080501', fog: '#120b02', fogDensity: 0.016, accent: HOT_GOLD, glow: 0.42 },
    thread: 'lanes',
    flare: 0.3,
    city: 0,
    leads: 3,
  },
  {
    id: 'how',
    label: 'How It Works',
    title: 'How It Works',
    span: 2.6,
    // Picks up the thread far out, then rides it through the three gates to the Core.
    camera: { position: [-26, 14.6, -5], target: [-13.5, 7, -2], fov: 46 },
    ride: [
      { position: [-17, 9.3, -2.8], target: [-7, 3, 0] },
      { position: [-10.2, 5, -0.8], target: [-3, 0.8, 0.4] },
      { position: [-6, 4.2, 8], target: [0.5, 0, 0.3] },
    ],
    gates: 1,
    framing: 0,
    lit: 4,
    spread: 0.9,
    damage: 0,
    grade: { background: '#04060f', fog: '#0a0c18', fogDensity: 0.014, accent: GOLD, glow: 0.42 },
    thread: 'riding',
    flare: 0.9,
    city: 0,
    leads: 12,
  },
  {
    id: 'who',
    label: 'Who We Serve',
    title: 'Built for Kenyan Service Businesses',
    span: 2,
    camera: { position: [6.5, 4.2, 13], target: [-2.4, 0, 0], fov: 35 },
    lit: 12,
    spread: 1,
    damage: 0,
    grade: { background: '#03061a', fog: '#080c26', fogDensity: 0.012, accent: HOT_GOLD, glow: 0.5 },
    thread: 'orbit',
    flare: 0.9,
    city: 0,
    leads: 28,
  },
  {
    id: 'proof',
    label: 'Results',
    title: 'What Our Clients Say',
    span: 2,
    camera: { position: [-3.6, -1.4, 9], target: [-1.6, 0, 0], fov: 38 },
    lit: 12,
    spread: 1,
    damage: 0,
    grade: { background: '#160b01', fog: '#231203', fogDensity: 0.014, accent: '#FF9A1F', glow: 0.8 },
    thread: 'flowing',
    flare: 1,
    city: 0,
    leads: 64,
  },
  {
    id: 'begin',
    label: 'Get Started',
    title: 'Ready to Get More Customers?',
    span: 1.6,
    camera: { position: [0, 1.4, 18], target: [0, -1.6, 0], fov: 32 },
    lit: 12,
    spread: 1,
    damage: 0,
    grade: { background: '#1a0f01', fog: '#2a1803', fogDensity: 0.01, accent: '#FFC23D', glow: 0.65 },
    thread: 'loop',
    flare: 1.2,
    city: 0,
    leads: 96,
  },
];

type HeroShot = Pick<ChapterConfig, 'camera' | 'grade' | 'lit' | 'spread' | 'thread'>;

function hero(id: string, title: string, shot: HeroShot): ChapterConfig {
  return { id, label: 'Overview', title, span: 1, leads: 0, damage: 0, flare: 0.8, city: 0, ...shot };
}

const worlds: Record<string, World> = {
  '/': { name: 'The Platinum Thread', chapters: home },
  '/websites': {
    name: 'The Blueprint',
    chapters: [
      hero('hero', 'A Website That Actually Works For Your Business', {
        camera: { position: [-6, 2, 10.5], target: [-1.8, 0, 0], fov: 40 },
        grade: { background: '#020818', fog: '#071028', fogDensity: 0.016, accent: '#FFB52E', glow: 0.5 },
        lit: 4,
        spread: 0.7,
        thread: 'riding',
      }),
    ],
  },
  '/automations': {
    name: 'The Signal Network',
    chapters: [
      hero('hero', 'Your Business, Running on Autopilot', {
        camera: { position: [6, -1, 10], target: [-2, 0, 0], fov: 40 },
        grade: { background: '#010e07', fog: '#031c0f', fogDensity: 0.02, accent: WHATSAPP, glow: 0.8 },
        lit: 8,
        spread: 0.85,
        thread: 'flowing',
      }),
    ],
  },
  '/ai-visibility': {
    name: 'The Oracle',
    chapters: [
      hero('hero', 'When Customers Ask AI, Your Business Should Be the Answer', {
        camera: { position: [-1, -4, 11], target: [-2.2, 0.6, 0], fov: 42 },
        grade: { background: '#0a0318', fog: '#150828', fogDensity: 0.018, accent: '#9B5CFF', glow: 0.8 },
        lit: 6,
        spread: 0.75,
        thread: 'crossing',
      }),
    ],
  },
  '/pricing': {
    name: 'The Three Lanes',
    chapters: [
      hero('hero', 'Simple, Transparent Pricing', {
        camera: { position: [0, 4, 13], target: [-1.5, 0, 0], fov: 35 },
        grade: { background: '#080501', fog: '#120b02', fogDensity: 0.012, accent: HOT_GOLD, glow: 0.55 },
        lit: 8,
        spread: 0.9,
        thread: 'lanes',
      }),
    ],
  },
  '/about': {
    name: 'The Team Constellation',
    chapters: [
      hero('hero', 'We Help Kenyan Businesses Win Online', {
        camera: { position: [4, 4, 13], target: [-2.2, 0, 0], fov: 36 },
        grade: { background: '#02061a', fog: '#080d28', fogDensity: 0.012, accent: '#FFC23D', glow: 0.55 },
        lit: 12,
        spread: 1,
        thread: 'orbit',
      }),
    ],
  },
  '/contact': {
    name: 'Landing',
    chapters: [
      hero('hero', "Let's Talk About Your Business", {
        camera: { position: [-1, 0.5, 18], target: [-3, 0, 0], fov: 30 },
        grade: { background: NAVY, fog: '#070b18', fogDensity: 0.008, accent: GOLD, glow: 0.3 },
        lit: 12,
        spread: 1,
        thread: 'resting',
      }),
    ],
  },
};

export function getWorld(pathname: string): World {
  return worlds[pathname] ?? worlds['/contact'];
}

/** Splits a fractional chapter value into its two neighbouring chapters and a blend. */
export function segment(chapter: number, count: number): { from: number; to: number; blend: number } {
  const clamped = Math.min(Math.max(chapter, 0), Math.max(count - 1, 0));
  const from = Math.floor(clamped);
  return { from, to: Math.min(from + 1, count - 1), blend: clamped - from };
}

/** Reads one number from the chapter config, blended at the current scroll position. */
export function sampleChapter(
  chapters: readonly ChapterConfig[],
  chapter: number,
  pick: (config: ChapterConfig) => number,
): number {
  const { from, to, blend } = segment(chapter, chapters.length);
  return pick(chapters[from]) + (pick(chapters[to]) - pick(chapters[from])) * blend;
}

/** Lists every point the camera passes through in a world, in order. */
export function buildRail(chapters: readonly ChapterConfig[]): { positions: Vec3[]; targets: Vec3[] } {
  const positions: Vec3[] = [];
  const targets: Vec3[] = [];
  for (const chapter of chapters) {
    positions.push(chapter.camera.position);
    targets.push(chapter.camera.target);
    for (const point of chapter.ride ?? []) {
      positions.push(point.position);
      targets.push(point.target);
    }
  }
  return { positions, targets };
}

/** Converts a fractional chapter into 0..1 along the rail from buildRail. */
export function railParameter(chapters: readonly ChapterConfig[], chapter: number): number {
  const { from, to, blend } = segment(chapter, chapters.length);
  let total = 0;
  let start = 0;
  let end = 0;
  chapters.forEach((config, index) => {
    if (index === from) start = total;
    if (index === to) end = total;
    total += 1 + (config.ride?.length ?? 0);
  });
  return total > 1 ? (start + (end - start) * blend) / (total - 1) : 0;
}

export function activeChapterIndex(chapter: number, count: number): number {
  // A chapter's value reaches i when its section top meets the viewport top, but its text is
  // already on screen about a quarter of the way through the section before.
  return Math.min(Math.max(Math.floor(chapter + 0.25), 0), Math.max(count - 1, 0));
}

export function formatChapter(index: number): string {
  return String(index).padStart(2, '0');
}
