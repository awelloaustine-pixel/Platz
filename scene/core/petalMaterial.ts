import { Color, MeshStandardMaterial } from 'three';

/**
 * Brushed dark metal with a per-instance HDR glow, drawn as a grid of solar cells.
 * The glow comes from an attribute updated each frame, so ignition costs no extra
 * draw calls, and values above 1 are what the Bloom pass picks up.
 */
export function createPanelMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color('#161a24'),
    metalness: 0.92,
    roughness: 0.34,
  });

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec3 aEmissive;
        varying vec3 vPanelEmissive;
        varying vec2 vPanelUv;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vPanelEmissive = aEmissive;
        vPanelUv = position.xy;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vPanelEmissive;
        varying vec2 vPanelUv;`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        vec2 cell = abs(fract(vPanelUv * vec2(4.0, 3.0) + 0.5) - 0.5);
        float gridLine = smoothstep(0.42, 0.5, max(cell.x, cell.y));
        vec2 edge = abs(vPanelUv) * 2.0;
        float frame = smoothstep(0.86, 1.0, max(edge.x, edge.y));
        diffuseColor.rgb += (gridLine + frame) * 0.07;
        totalEmissiveRadiance += vPanelEmissive * (1.0 - 0.72 * gridLine) * (1.0 - 0.45 * frame);`,
      );
  };

  return material;
}
