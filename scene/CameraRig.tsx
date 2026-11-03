'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { activeChapterIndex, buildRail, getWorld, railParameter, sampleChapter, type Vec3 } from '@/timeline/chapters';
import { master, ui } from '@/timeline/store';
import { BEAMS } from './thread/threadPath';

const SMOOTHING = 4.5;
/** Portrait phones cannot sit the Core beside the text, so it moves above the text instead. */
const PORTRAIT_PULLBACK = 1.45;
const PORTRAIT_DROP = 2.4;

const LANE_POINTS = BEAMS.filter((beam) => beam.group === 'lanes').map(
  ({ points: [, , [x, y, z]] }) => new Vector3(x, y, z),
);
const LANE_APPROACH = new Vector3(0, 0.8, 6);
const laneCamera = new Vector3();
const nextPosition = new Vector3();
const nextTarget = new Vector3();
const toVector = ([x, y, z]: Vec3) => new Vector3(x, y, z);

interface Rail {
  positions: CatmullRomCurve3 | null;
  targets: CatmullRomCurve3 | null;
  fallback: { position: Vector3; target: Vector3 };
}

const rails = new Map<string, Rail>();

/** One continuous camera path per world, so a chapter change is never a cut. */
function getRail(pathname: string): Rail {
  const cached = rails.get(pathname);
  if (cached) return cached;
  const { positions, targets } = buildRail(getWorld(pathname).chapters);
  const rail: Rail = {
    positions: positions.length > 1 ? new CatmullRomCurve3(positions.map(toVector)) : null,
    targets: targets.length > 1 ? new CatmullRomCurve3(targets.map(toVector)) : null,
    fallback: { position: toVector(positions[0]), target: toVector(targets[0]) },
  };
  rails.set(pathname, rail);
  return rail;
}

/**
 * Follows the rail. Damping, not jumping, is what makes a route change fly the camera
 * to the next world: the new world's shot simply becomes the target.
 */
export function CameraRig({ pathname }: { pathname: string }) {
  const lookAt = useRef(new Vector3());

  useFrame(({ camera, size }, delta) => {
    const chapters = getWorld(pathname).chapters;
    const rail = getRail(pathname);
    const along = railParameter(chapters, master.chapter);

    if (rail.positions && rail.targets) {
      rail.positions.getPoint(along, nextPosition);
      rail.targets.getPoint(along, nextTarget);
    } else {
      nextPosition.copy(rail.fallback.position);
      nextTarget.copy(rail.fallback.target);
    }

    if (size.width < size.height) {
      // Shots that fly along the thread opt out, or the camera would miss the gates.
      const framing = sampleChapter(chapters, master.chapter, (chapter) => chapter.framing ?? 1);
      nextPosition.x *= MathUtils.lerp(1, 0.4, framing);
      nextPosition.z *= MathUtils.lerp(1, PORTRAIT_PULLBACK, framing);
      nextTarget.x *= MathUtils.lerp(1, 0.15, framing);
      nextTarget.y -= PORTRAIT_DROP * framing;
    }

    const { laneFocus } = ui.get();
    const shot = chapters[activeChapterIndex(master.chapter, chapters.length)];
    if (laneFocus >= 0 && shot.thread === 'lanes') {
      const lane = LANE_POINTS[laneFocus];
      nextPosition.lerp(laneCamera.copy(lane).add(LANE_APPROACH), 0.5);
      nextTarget.lerp(lane, 0.55);
    }

    const amount = 1 - Math.exp(-SMOOTHING * delta);
    camera.position.lerp(nextPosition, amount);
    lookAt.current.lerp(nextTarget, amount);
    camera.lookAt(lookAt.current);

    if (camera instanceof PerspectiveCamera) {
      const fov = sampleChapter(chapters, master.chapter, (chapter) => chapter.camera.fov);
      camera.fov = MathUtils.damp(camera.fov, fov, SMOOTHING, delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
