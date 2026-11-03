'use client';

import { CameraRig } from './CameraRig';
import { GradeRig } from './effects/GradeRig';
import { PlaceholderCore } from './core/PlaceholderCore';

/** Step 1 stand-in. Step 2 replaces PlaceholderCore; step 5 adds a world per route. */
export function Experience({ pathname }: { pathname: string }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={2} />
      <CameraRig pathname={pathname} />
      <GradeRig pathname={pathname} />
      <PlaceholderCore />
    </>
  );
}
