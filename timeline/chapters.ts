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
  petalsLit: number;
  /** 0 = petals closed, 1 = fully open. */
  unfold: number;
  /** 0 = intact, 1 = cracked apart and flickering. */
  damage: number;
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
    camera: { position: [-2.3, 0.2, 13], target: [-2.5, 0, 0], fov: 35 },
    petalsLit: 0,
    unfold: 0.2,
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
    camera: { position: [5, 1.6, 10], target: [-2, 0.4, 0], fov: 38 },
    petalsLit: 0,
    unfold: 0.72,
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
    camera: { position: [-5, 2.6, 11.5], target: [-1.8, 0, 0], fov: 35 },
    petalsLit: 1,
    unfold: 0.68,
    damage: 0,
    grade: { background: '#080501', fog: '#120b02', fogDensity: 0.016, accent: HOT_GOLD, glow: 0.42 },
    thread: 'lanes',
    flare: 0.8,
    city: 0,
    leads: 3,
  },
  {
    id: 'how',
    label: 'How It Works',
    title: 'How It Works',
    span: 2.6,
    camera: { position: [1.4, 0.8, 7.5], target: [-1.4, 0, -1], fov: 46 },
    petalsLit: 4,
    unfold: 0.85,
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
    petalsLit: 12,
    unfold: 1,
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
    petalsLit: 12,
    unfold: 1,
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
    petalsLit: 12,
    unfold: 1,
    damage: 0,
    grade: { background: '#1a0f01', fog: '#2a1803', fogDensity: 0.01, accent: '#FFC23D', glow: 1 },
    thread: 'loop',
    flare: 1.2,
    city: 0,
    leads: 96,
  },
];

type HeroShot = Pick<ChapterConfig, 'camera' | 'grade' | 'petalsLit' | 'unfold' | 'thread'>;

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
        petalsLit: 4,
        unfold: 0.7,
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
        petalsLit: 8,
        unfold: 0.85,
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
        petalsLit: 6,
        unfold: 0.75,
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
        petalsLit: 8,
        unfold: 0.9,
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
        petalsLit: 12,
        unfold: 1,
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
        petalsLit: 12,
        unfold: 1,
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

export function activeChapterIndex(chapter: number, count: number): number {
  return Math.min(Math.max(Math.round(chapter), 0), Math.max(count - 1, 0));
}

export function formatChapter(index: number): string {
  return String(index).padStart(2, '0');
}
