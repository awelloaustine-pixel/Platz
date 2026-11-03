import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activeChapterIndex, formatChapter, getWorld, sampleChapter, segment } from './chapters.ts';

test('home has the seven chapters of the storyboard', () => {
  assert.deepEqual(
    getWorld('/').chapters.map((chapter) => chapter.id),
    ['arrival', 'problem', 'system', 'how', 'who', 'proof', 'begin'],
  );
});

test('every petal count stays within the machine', () => {
  for (const path of ['/', '/websites', '/automations', '/ai-visibility', '/pricing', '/about', '/contact']) {
    for (const chapter of getWorld(path).chapters) {
      assert.ok(chapter.petalsLit >= 0 && chapter.petalsLit <= 12, `${path} ${chapter.id}`);
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
  // Chapter 3 lights 4 petals and chapter 4 lights all 12.
  assert.equal(sampleChapter(chapters, 3.5, (chapter) => chapter.petalsLit), 8);
  assert.equal(sampleChapter(chapters, 6, (chapter) => chapter.petalsLit), 12);
});

test('the active chapter changes at the halfway point and stays in range', () => {
  assert.equal(activeChapterIndex(1.4, 7), 1);
  assert.equal(activeChapterIndex(1.5, 7), 2);
  assert.equal(activeChapterIndex(50, 7), 6);
});

test('chapter numbers are zero padded', () => {
  assert.equal(formatChapter(4), '04');
});
