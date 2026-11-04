import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  activeChapterIndex,
  buildRail,
  chapterAtScroll,
  posterPath,
  formatChapter,
  getWorld,
  railParameter,
  sampleChapter,
  segment,
} from './chapters.ts';

test('home has the seven chapters of the storyboard', () => {
  assert.deepEqual(
    getWorld('/').chapters.map((chapter) => chapter.id),
    ['arrival', 'problem', 'system', 'how', 'who', 'proof', 'begin'],
  );
});

test('every lit count stays within the 12 stones', () => {
  for (const path of ['/', '/websites', '/automations', '/ai-visibility', '/pricing', '/about', '/contact']) {
    for (const chapter of getWorld(path).chapters) {
      assert.ok(chapter.lit >= 0 && chapter.lit <= 12, `${path} ${chapter.id}`);
    }
  }
});

test('segment blends between neighbours and clamps at both ends', () => {
  assert.deepEqual(segment(2.25, 7), { from: 2, to: 3, blend: 0.25 });
  assert.deepEqual(segment(-1, 7), { from: 0, to: 1, blend: 0 });
  assert.deepEqual(segment(9, 7), { from: 6, to: 6, blend: 0 });
  assert.deepEqual(segment(0, 1), { from: 0, to: 0, blend: 0 });
});

test('sampleChapter blends a value between chapters', () => {
  const { chapters } = getWorld('/');
  // Chapter 3 lights 4 stones and chapter 4 lights all 12.
  assert.equal(sampleChapter(chapters, 3.5, (chapter) => chapter.lit), 8);
  assert.equal(sampleChapter(chapters, 6, (chapter) => chapter.lit), 12);
});

test('the rail runs through every chapter shot and ride point in order', () => {
  const { chapters } = getWorld('/');
  const { positions } = buildRail(chapters);
  const rideLength = chapters.reduce((sum, chapter) => sum + (chapter.ride?.length ?? 0), 0);
  assert.equal(positions.length, chapters.length + rideLength);

  // Each chapter at rest must land exactly on its own shot, including those after the ride.
  chapters.forEach((chapter, index) => {
    const point = Math.round(railParameter(chapters, index) * (positions.length - 1));
    assert.deepEqual(positions[point], chapter.camera.position, chapter.id);
  });
});

test('a one-shot world has a rail parameter of zero', () => {
  assert.equal(railParameter(getWorld('/contact').chapters.slice(0, 1), 0), 0);
});

test('scroll position converts to a fractional chapter', () => {
  const tops = [0, 1000, 3000, 3000];
  assert.equal(chapterAtScroll(0, tops), 0);
  assert.equal(chapterAtScroll(500, tops), 0.5);
  assert.equal(chapterAtScroll(2000, tops), 1.5);
  assert.equal(chapterAtScroll(9000, tops), 3);
  assert.equal(chapterAtScroll(100, [0]), 0);
  assert.equal(chapterAtScroll(100, []), 0);
});

test('every world and chapter has a poster name', () => {
  assert.equal(posterPath('/', 1, true), '/posters/home-problem-m.webp');
  assert.equal(posterPath('/automations', 3, false), '/posters/automations-d.webp');
  assert.equal(posterPath('/not-a-page', 0, false), '/posters/contact-d.webp');
});

test('the active chapter changes as the next section arrives and stays in range', () => {
  assert.equal(activeChapterIndex(1.7, 7), 1);
  assert.equal(activeChapterIndex(1.75, 7), 2);
  assert.equal(activeChapterIndex(50, 7), 6);
});

test('chapter numbers are zero padded', () => {
  assert.equal(formatChapter(4), '04');
});
