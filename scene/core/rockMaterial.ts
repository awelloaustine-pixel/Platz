import { MeshStandardMaterial } from 'three';

/**
 * Dark basalt with procedural surface detail and gold veins in its cracks.
 * aEmissive is the vein colour (HDR, so it blooms). aFront is how far from the centre
 * of the scene ignition has reached, so light travels outward across each rock.
 */
export function createRockMaterial(octaves: 2 | 3): MeshStandardMaterial {
  const material = new MeshStandardMaterial({ color: '#4a4a50', roughness: 0.94, metalness: 0.02 });

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec3 aEmissive;
        attribute float aFront;
        varying vec3 vRockPosition;
        varying vec3 vVeinColor;
        varying float vFront;
        varying float vCentreDistance;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vRockPosition = position;
        vVeinColor = aEmissive;
        vFront = aFront;
        #ifdef USE_INSTANCING
          vCentreDistance = length((modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz);
        #else
          vCentreDistance = length((modelMatrix * vec4(position, 1.0)).xyz);
        #endif`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vRockPosition;
        varying vec3 vVeinColor;
        varying float vFront;
        varying float vCentreDistance;

        float rockHash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float rockNoise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(rockHash(i), rockHash(i + vec3(1, 0, 0)), f.x), mix(rockHash(i + vec3(0, 1, 0)), rockHash(i + vec3(1, 1, 0)), f.x), f.y),
            mix(mix(rockHash(i + vec3(0, 0, 1)), rockHash(i + vec3(1, 0, 1)), f.x), mix(rockHash(i + vec3(0, 1, 1)), rockHash(i + vec3(1, 1, 1)), f.x), f.y),
            f.z
          );
        }`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float rockGrain = rockNoise(vRockPosition * 5.0) * 0.62 + rockNoise(vRockPosition * 12.0) * 0.38;
        #if ROCK_OCTAVES > 2
          rockGrain = rockGrain * 0.8 + rockNoise(vRockPosition * 27.0) * 0.2;
        #endif
        // Warping by finer noise makes jagged fractures rather than smooth worm-like curves.
        float crackWarp = rockNoise(vRockPosition * 4.0) * 0.7 + rockNoise(vRockPosition * 11.0) * 0.22;
        float crackLine = 1.0 - abs(2.0 * rockNoise(vRockPosition * 2.9 + crackWarp) - 1.0);
        float vein = smoothstep(0.972, 0.996, crackLine);
        float veinHalo = smoothstep(0.86, 0.995, crackLine);
        float rockHeight = rockGrain - veinHalo * 0.4;
        diffuseColor.rgb *= 0.5 + rockGrain * 0.95;
        diffuseColor.rgb *= 1.0 - veinHalo * 0.55;`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        vec3 surfaceDx = dFdx(-vViewPosition);
        vec3 surfaceDy = dFdy(-vViewPosition);
        vec3 bumpR1 = cross(surfaceDy, normal);
        vec3 bumpR2 = cross(normal, surfaceDx);
        float bumpDet = dot(surfaceDx, bumpR1);
        vec3 bumpGradient = sign(bumpDet) * (dFdx(rockHeight) * bumpR1 + dFdy(rockHeight) * bumpR2);
        normal = normalize(abs(bumpDet) * normal - 0.035 * bumpGradient);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float veinReach = 1.0 - smoothstep(vFront - 0.5, vFront, vCentreDistance);
        totalEmissiveRadiance += vVeinColor * (vein * 3.2 + veinHalo * veinHalo * 0.32) * veinReach;`,
      );
  };

  material.defines = { ...material.defines, ROCK_OCTAVES: octaves };
  material.customProgramCacheKey = () => `rock-${octaves}`;
  return material;
}
