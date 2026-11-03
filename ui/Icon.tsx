const PATHS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4',
  phone: 'M6 3h3l2 5-2 1.5a12 12 0 0 0 5.5 5.5L16 13l5 2v3a3 3 0 0 1-3 3A15 15 0 0 1 3 6a3 3 0 0 1 3-3ZM15 4l5 5m0-5-5 5',
  spark: 'M12 3l2 6.5L20.5 12 14 14l-2 7-2-7-6.5-2L10 9.5 12 3Zm7 13 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z',
  monitor: 'M3 5h18v11H3V5Zm6 15h6m-3-4v4',
  message: 'M4 5h16v11H9l-5 4V5Zm4 5h8m-8 3h5',
  tooth: 'M12 6c-2-2-7-2.5-7 2.5 0 3 1.5 4 2 7 .4 2.5 1 4.5 2 4.5 1.5 0 1-5 3-5s1.500 5 3 5c1 0 1.600-2 2-4.500.5-3 2-4 2-7C19 3.500 14 4 12 6Z',
  key: 'M8 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm3 1 8-8m-3 3 3 3m-6 0 2 2',
  bed: 'M3 7v12m0-4h18v4m0-4v-3a3 3 0 0 0-3-3h-8v6M7 10.500h.01',
  wrench: 'M15 4a5 5 0 0 0-4.500 7L4 17.500 6.500 20l6.500-6.500A5 5 0 0 0 20 9l-3 3-3-1-1-3 3-3a5 5 0 0 0-1-1Z',
  plate: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM4 3v6a2 2 0 0 0 2 2M2 3v6m6-6v6M5 11v10m15-18c-1.500 1-2 3.500-2 6s1 3 2 3v9',
  scissors: 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm2.500-7.500L20 19M8.500 16.500 20 5',
  dumbbell: 'M3 9v6m3-8v10m12-10v10m3-8v6M6 12h12',
  scale: 'M12 3v18m-6 0h12M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7Zm14 0-3 7a3 3 0 0 0 6 0l-3-7Z',
  sparkle: 'M10 4l1.800 5.200L17 11l-5.200 1.800L10 18l-1.800-5.200L3 11l5.200-1.800L10 4Zm8 10 .9 2.100L21 17l-2.100.9L18 20l-.9-2.100L15 17l2.100-.9L18 14Z',
  book: 'M12 6c-2-1.500-5-2-8-2v15c3 0 6 .5 8 2 2-1.500 5-2 8-2V4c-3 0-6 .5-8 2Zm0 0v15',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
