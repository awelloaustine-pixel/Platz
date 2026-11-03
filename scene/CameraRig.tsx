'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { getWorld, segment, type Vec3 } from '@/timeline/chapters';
import { master } from '@/timeline/store';

const SMOOTHING = 3;
const nextPosition = new Vector3();
const nextTarget = new Vector3();

function blendInto(out: Vector3, a: Vec3, b: Vec3, blend: number): Vector3 {
  return out.set(
    MathUtils.lerp(a[0], b[0], blend),
    MathUtils.lerp(a[1], b[1], blend),
    MathUtils.lerp(a[2], b[2], blend),
  );
}

/**
 * Follows the sampled chapter. Damping, not jumping, is what makes a route change fly
 * the camera to the next world: the new world's shot simply becomes the target.
 */
export function CameraRig({ pathname }: { pathname: string }) {
  const lookAt = useRef(new Vector3());

  useFrame(({ camera }, delta) => {
    const chapters = getWorld(pathname).chapters;
    const { from, to, blend } = segment(master.chapter, chapters.length);
    const a = chapters[from].camera;
    const b = chapters[to].camera;

    blendInto(nextPosition, a.position, b.position, blend);
    blendInto(nextTarget, a.target, b.target, blend);

    const amount = 1 - Math.exp(-SMOOTHING * delta);
    camera.position.lerp(nextPosition, amount);
    lookAt.current.lerp(nextTarget, amount);
    camera.lookAt(lookAt.current);

    if (camera instanceof PerspectiveCamera) {
      camera.fov = MathUtils.damp(camera.fov, MathUtils.lerp(a.fov, b.fov, blend), SMOOTHING, delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
