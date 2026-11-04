// The single source of truth. The 3D scene and the DOM both read the same scroll
// value (master.chapter) and sample these configs, which keeps them in lockstep.

import { aiProblem as aiProblemLines, automationProblem as automationProblemLines } from '../content/services.ts';
import { features } from '../content/site.ts';

export type Vec3 = readonly [number, number, number];

export type ThreadState =
  | 'crossing'
  | 'splintered'
  | 'lanes'
  | 'riding'
  | 'orbit'
  | 'flowing'
  | 'loop'
  | 'resting'
  | 'blueprint'
  | 'silent'
  | 'answer'
  | 'parallel'
  | 'merged'
  | 'team';

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
  /** Size and place of the Core in this shot. Defaults to full size at the centre. */
  core?: { scale: number; position: Vec3 };
  /** Hovering a pricing tier lights 4, 8 or 12 stones of the Core. */
  tierLit?: boolean;
  /** glow = how strongly the accent colour fills the space around the Core. */
  grade: { background: string; fog: string; fogDensity: number; accent: string; glow: number };
  thread: ThreadState;
  /** Strength of the light where the thread meets the hub. */
  flare: number;
  /** Strength of the Nairobi skyline lights in the distance. */
  city: number;
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

const automationProblem = automationProblemLines[0];
const aiProblem = aiProblemLines[0];

const allHomeChapters: readonly ChapterConfig[] = [
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
  },
];

const home = allHomeChapters.filter((chapter) => chapter.id !== 'proof' || features.results);

type InnerGrade = ChapterConfig['grade'];

/** One shot of an inner page. Everything not given takes a quiet default. */
function shot(
  id: string,
  label: string,
  title: string,
  span: number,
  camera: ChapterConfig['camera'],
  grade: InnerGrade,
  rest: Partial<ChapterConfig> = {},
): ChapterConfig {
  return {
    id,
    label,
    title,
    span,
    camera,
    grade,
    lit: 0,
    spread: 1,
    damage: 0,
    thread: 'resting',
    flare: 0,
    city: 0,
    ...rest,
  };
}

const NO_CORE: ChapterConfig['core'] = { scale: 0, position: [0, 0, 0] };

const BLUEPRINT_GRADE: InnerGrade = { background: '#020818', fog: '#071028', fogDensity: 0.012, accent: HOT_GOLD, glow: 0.3 };
const SIGNAL_GRADE: InnerGrade = { background: '#010e07', fog: '#031c0f', fogDensity: 0.012, accent: WHATSAPP, glow: 0.42 };
const ORACLE_GRADE: InnerGrade = { background: '#0a0318', fog: '#150828', fogDensity: 0.016, accent: '#9B5CFF', glow: 0.5 };
const LANES_GRADE: InnerGrade = { background: '#080501', fog: '#120b02', fogDensity: 0.01, accent: HOT_GOLD, glow: 0.3 };
const TEAM_GRADE: InnerGrade = { background: '#02061a', fog: '#080d28', fogDensity: 0.012, accent: '#FFC23D', glow: 0.4 };
const LANDING_GRADE: InnerGrade = { background: NAVY, fog: '#070b18', fogDensity: 0.008, accent: GOLD, glow: 0.2 };

const worlds: Record<string, World> = {
  '/': { name: 'The Platinum Thread', chapters: home },
  '/websites': {
    name: 'The Blueprint',
    chapters: [
      shot('hero', 'Overview', 'A Website That Actually Works For Your Business', 1.2, { position: [-2.6, 0.6, 14], target: [-2.6, 0.2, 0], fov: 36 }, BLUEPRINT_GRADE, {
        thread: 'blueprint',
        core: NO_CORE,
      }),
      shot('features', 'What You Get', 'What You Get', 2.8, { position: [1.6, 0.4, 10.5], target: [-0.9, 0, 0], fov: 38 }, BLUEPRINT_GRADE, {
        thread: 'blueprint',
        core: NO_CORE,
      }),
      shot('pricing', 'Pricing', 'Pricing', 1.3, { position: [-1, 3.2, 17], target: [-0.8, 2.2, 0], fov: 36 }, BLUEPRINT_GRADE, {
        thread: 'blueprint',
        tierLit: true,
        core: { scale: 0.32, position: [1.6, 4.6, 0] },
      }),
      shot('faq', 'FAQ', 'FAQ', 1.2, { position: [-3.4, 0.4, 13], target: [-3, 0.4, 0], fov: 36 }, BLUEPRINT_GRADE, {
        thread: 'blueprint',
        core: NO_CORE,
      }),
    ],
  },
  '/automations': {
    name: 'The Signal Network',
    chapters: [
      shot('hero', 'Overview', 'Your Business, Running on Autopilot', 1.2, { position: [-2.4, -0.2, 15], target: [-3.2, 0, 0], fov: 38 }, SIGNAL_GRADE, { core: NO_CORE, thread: 'silent' }),
      shot('problem', 'The Problem', automationProblem, 1.5, { position: [3, 1.2, 13], target: [-3.4, 0.6, 0], fov: 38 }, SIGNAL_GRADE, { core: NO_CORE, thread: 'silent' }),
      shot('network', 'The 7 Stations', 'The 7 Stations', 4, { position: [-2.2, 1.2, 15], target: [-3.4, 0.8, 0], fov: 38 }, SIGNAL_GRADE, { core: NO_CORE, thread: 'silent' }),
      shot('pricing', 'Pricing', 'Pricing', 1.3, { position: [0, 3.4, 19], target: [-0.6, 3.4, 0], fov: 36 }, SIGNAL_GRADE, { core: NO_CORE, thread: 'silent' }),
      shot('faq', 'FAQ', 'FAQ', 1.2, { position: [-4, -0.4, 15], target: [-4, 0, 0], fov: 38 }, SIGNAL_GRADE, { core: NO_CORE, thread: 'silent' }),
    ],
  },
  '/ai-visibility': {
    name: 'The Oracle',
    chapters: [
      shot('hero', 'Overview', 'When Customers Ask AI, Your Business Should Be the Answer', 1.2, { position: [-1.8, -0.3, 12], target: [-1.8, 0.1, 0], fov: 42 }, ORACLE_GRADE, { core: NO_CORE, thread: 'answer' }),
      shot('problem', 'The Problem', aiProblem, 1.5, { position: [2.2, 0.2, 10], target: [-2.2, 0.2, 0], fov: 42 }, ORACLE_GRADE, { core: NO_CORE, thread: 'answer' }),
      shot('demo', 'Try It Yourself', 'Try It Yourself', 1.5, { position: [-3, 0.6, 10], target: [-1.8, 0.2, 0], fov: 40 }, ORACLE_GRADE, { core: NO_CORE, thread: 'answer' }),
      shot('steps', 'What We Do', 'What We Do', 3.6, { position: [2.6, -0.4, 10], target: [-1.6, 0.8, 0], fov: 42 }, ORACLE_GRADE, { core: NO_CORE, thread: 'answer' }),
      shot('pricing', 'Pricing', 'Pricing', 1.3, { position: [0, 2.4, 14], target: [0, 1.8, 0], fov: 40 }, ORACLE_GRADE, { core: NO_CORE, thread: 'answer' }),
    ],
  },
  '/pricing': {
    name: 'The Three Lanes',
    chapters: [
      shot('hero', 'Overview', 'Simple, Transparent Pricing', 1.2, { position: [0, 3, 13], target: [0, 0, -8], fov: 36 }, LANES_GRADE, {
        thread: 'parallel',
        lit: 12,
        core: { scale: 0.45, position: [0, 0, -30] },
      }),
      shot('lanes', 'The Three Lanes', 'The Three Lanes', 1.2, { position: [0, 1.8, 15], target: [0, 1.6, -8], fov: 34 }, LANES_GRADE, {
        thread: 'parallel',
        lit: 12,
        core: { scale: 0.45, position: [0, 0, -30] },
      }),
      shot('bundle', 'Bundle', 'Bundle and Save', 1.3, { position: [-1, 3, 12], target: [-2.6, 0.5, -10], fov: 38 }, LANES_GRADE, {
        thread: 'merged',
        lit: 12,
        flare: 0.7,
        core: { scale: 0.45, position: [0, 0, -30] },
      }),
    ],
  },
  '/about': {
    name: 'The Team Constellation',
    chapters: [
      shot('hero', 'Overview', 'We Help Kenyan Businesses Win Online', 1.2, { position: [2.6, 1.6, 13], target: [-2.4, 0, 0], fov: 36 }, TEAM_GRADE, {
        thread: 'team',
        lit: 12,
        flare: 0.6,
        core: { scale: 0.5, position: [0, 0, 0] },
      }),
      shot('story', 'Our Story', 'Our Story', 1.6, { position: [-3, 0.4, 12], target: [-3, 0, 0], fov: 38 }, TEAM_GRADE, {
        thread: 'team',
        lit: 12,
        flare: 0.6,
        core: { scale: 0.5, position: [0, 0, 0] },
      }),
      shot('team', 'The Team', 'The Team', 1.3, { position: [0, 2.6, 14], target: [0, 2.2, 0], fov: 38 }, TEAM_GRADE, {
        thread: 'team',
        lit: 12,
        flare: 0.6,
        core: { scale: 0.5, position: [0, 0, 0] },
      }),
      shot('values', 'Our Values', 'Our Values', 2, { position: [2.4, -1.4, 11], target: [-2.2, 0, 0], fov: 38 }, TEAM_GRADE, {
        thread: 'team',
        lit: 3,
        flare: 0.6,
        core: { scale: 0.5, position: [0, 0, 0] },
      }),
    ],
  },
  '/contact': {
    name: 'Landing',
    chapters: [
      shot('hero', 'Overview', "Let's Talk About Your Business", 1.1, { position: [-1, 0.5, 18], target: [-3, 0, 0], fov: 30 }, LANDING_GRADE, {
        thread: 'resting',
        lit: 12,
        flare: 0.4,
        core: { scale: 0.65, position: [0, 0, 0] },
      }),
      // Quiet on purpose: the form is the focus here, so the Core drifts up and away.
      shot('enquire', 'Get in Touch', 'Get in Touch', 1.1, { position: [0, 1, 22], target: [-1, -1.5, 0], fov: 30 }, LANDING_GRADE, {
        thread: 'resting',
        lit: 12,
        flare: 0.25,
        core: { scale: 0.4, position: [6, 5, -2] },
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

/** Fractional chapter for a scroll position, given each section's measured top. */
export function chapterAtScroll(scroll: number, tops: readonly number[]): number {
  for (let index = tops.length - 2; index >= 0; index -= 1) {
    if (scroll >= tops[index] && tops[index + 1] > tops[index]) {
      return Math.min(index + (scroll - tops[index]) / (tops[index + 1] - tops[index]), tops.length - 1);
    }
  }
  return 0;
}

/** The home page has a still per chapter. Other pages share one still per world, to save data. */
export function posterPath(pathname: string, chapterIndex: number, portrait: boolean): string {
  const size = portrait ? 'm' : 'd';
  if (pathname === '/') return `/posters/home-${home[chapterIndex]?.id ?? home[0].id}-${size}.webp`;
  const known = worlds[pathname] ? pathname : '/contact';
  return `/posters/${known.slice(1)}-${size}.webp`;
}

export function activeChapterIndex(chapter: number, count: number): number {
  // A chapter's value reaches i when its section top meets the viewport top, but its text is
  // already on screen about a quarter of the way through the section before.
  return Math.min(Math.max(Math.floor(chapter + 0.25), 0), Math.max(count - 1, 0));
}

export function formatChapter(index: number): string {
  return String(index).padStart(2, '0');
}
