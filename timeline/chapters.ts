// The single source of truth. The 3D scene and the DOM both read the same scroll
// value (master.chapter) and sample these configs, which keeps them in lockstep.
// Camera, grade and thread values are first passes, tuned in build steps 2 and 3.

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
  grade: { background: string; fog: string; fogDensity: number; accent: string };
  thread: ThreadState;
  /** Running value of the LEADS CAPTURED readout when this shot is at rest. */
  leads: number;
}

export interface World {
  name: string;
  chapters: readonly ChapterConfig[];
}

const GOLD = '#D4A62A';
const NAVY = '#020617';

const home: readonly ChapterConfig[] = [
  {
    id: 'arrival',
    label: 'Arrival',
    title: 'Your Business Deserves More Customers',
    span: 1.6,
    camera: { position: [0, 0, 9], target: [0, 0, 0], fov: 35 },
    petalsLit: 0,
    unfold: 0,
    grade: { background: NAVY, fog: NAVY, fogDensity: 0.02, accent: GOLD },
    thread: 'crossing',
    leads: 0,
  },
  {
    id: 'problem',
    label: 'The Problem',
    title: "Your Competitors Are Getting the Customers You're Missing",
    span: 2,
    camera: { position: [3.5, 1, 7], target: [0, 0, 0], fov: 38 },
    petalsLit: 0,
    unfold: 0.15,
    grade: { background: '#10060d', fog: '#1a0a14', fogDensity: 0.05, accent: '#C2334A' },
    thread: 'splintered',
    leads: 0,
  },
  {
    id: 'system',
    label: 'What We Do',
    title: 'One System. Three Ways to Win Customers.',
    span: 2,
    camera: { position: [-4, 2, 8], target: [0, 0, 0], fov: 35 },
    petalsLit: 0,
    unfold: 0.5,
    grade: { background: '#0a0805', fog: '#14100a', fogDensity: 0.03, accent: GOLD },
    thread: 'lanes',
    leads: 3,
  },
  {
    id: 'how',
    label: 'How It Works',
    title: 'How It Works',
    span: 2.6,
    camera: { position: [0, 0.4, 4.5], target: [0, 0, -1], fov: 45 },
    petalsLit: 4,
    unfold: 0.75,
    grade: { background: '#07070a', fog: '#100d08', fogDensity: 0.03, accent: GOLD },
    thread: 'riding',
    leads: 12,
  },
  {
    id: 'who',
    label: 'Who We Serve',
    title: 'Built for Kenyan Service Businesses',
    span: 2,
    camera: { position: [5, 3, 9], target: [0, 0, 0], fov: 35 },
    petalsLit: 12,
    unfold: 1,
    grade: { background: '#05070d', fog: '#0b0d14', fogDensity: 0.02, accent: GOLD },
    thread: 'orbit',
    leads: 28,
  },
  {
    id: 'proof',
    label: 'Results',
    title: 'What Our Clients Say',
    span: 2,
    camera: { position: [-2, -1, 6.5], target: [0, 0, 0], fov: 38 },
    petalsLit: 12,
    unfold: 1,
    grade: { background: '#120c03', fog: '#1d1405', fogDensity: 0.03, accent: '#F0C24B' },
    thread: 'flowing',
    leads: 64,
  },
  {
    id: 'begin',
    label: 'Get Started',
    title: 'Ready to Get More Customers?',
    span: 1.6,
    camera: { position: [0, 1, 14], target: [0, 0, 0], fov: 32 },
    petalsLit: 12,
    unfold: 1,
    grade: { background: '#0a0702', fog: '#120d04', fogDensity: 0.015, accent: '#F0C24B' },
    thread: 'loop',
    leads: 96,
  },
];

function hero(
  id: string,
  title: string,
  overrides: Pick<ChapterConfig, 'camera' | 'grade' | 'petalsLit' | 'unfold' | 'thread'>,
): ChapterConfig {
  return { id, label: 'Overview', title, span: 1, leads: 0, ...overrides };
}

const worlds: Record<string, World> = {
  '/': { name: 'The Platinum Thread', chapters: home },
  '/websites': {
    name: 'The Blueprint',
    chapters: [
      hero('hero', 'A Website That Actually Works For Your Business', {
        camera: { position: [-6, 2, 7], target: [1, 0, 0], fov: 40 },
        grade: { background: '#04070f', fog: '#0a0f1c', fogDensity: 0.03, accent: GOLD },
        petalsLit: 4,
        unfold: 0.6,
        thread: 'riding',
      }),
    ],
  },
  '/automations': {
    name: 'The Signal Network',
    chapters: [
      hero('hero', 'Your Business, Running on Autopilot', {
        camera: { position: [6, -1, 6], target: [-1, 0, 0], fov: 40 },
        grade: { background: '#02100a', fog: '#052014', fogDensity: 0.04, accent: '#25D366' },
        petalsLit: 8,
        unfold: 0.8,
        thread: 'flowing',
      }),
    ],
  },
  '/ai-visibility': {
    name: 'The Oracle',
    chapters: [
      hero('hero', 'When Customers Ask AI, Your Business Should Be the Answer', {
        camera: { position: [0, -3, 8], target: [0, 1, 0], fov: 42 },
        grade: { background: '#0c0512', fog: '#180a22', fogDensity: 0.04, accent: GOLD },
        petalsLit: 6,
        unfold: 0.7,
        thread: 'crossing',
      }),
    ],
  },
  '/pricing': {
    name: 'The Three Lanes',
    chapters: [
      hero('hero', 'Simple, Transparent Pricing', {
        camera: { position: [0, 4, 10], target: [0, 0, 0], fov: 35 },
        grade: { background: '#07070a', fog: '#100d08', fogDensity: 0.02, accent: GOLD },
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
        camera: { position: [4, 4, 9], target: [0, 0, 0], fov: 36 },
        grade: { background: '#040812', fog: '#0a1020', fogDensity: 0.02, accent: GOLD },
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
        camera: { position: [0, 0.5, 11], target: [0, 0, 0], fov: 30 },
        grade: { background: NAVY, fog: '#070b18', fogDensity: 0.01, accent: GOLD },
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

export function activeChapterIndex(chapter: number, count: number): number {
  return Math.min(Math.max(Math.round(chapter), 0), Math.max(count - 1, 0));
}

export function formatChapter(index: number): string {
  return String(index).padStart(2, '0');
}
