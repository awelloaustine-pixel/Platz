export const threadVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

/** A white-hot core with coloured falloff and energy flowing along the length. */
export const threadFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uWeight;
  uniform float uDraw;
  uniform float uBroken;
  uniform float uLength;
  uniform float uFlow;
  uniform vec3 uColor;

  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), f);
  }

  void main() {
    float along = vUv.x * uLength;
    float facing = abs(dot(normalize(vNormalView), normalize(vViewDir)));
    float core = pow(facing, 2.2);

    float energy = 0.72 + 0.55 * noise(along * 1.1 - uTime * 2.6 * uFlow);
    float packets = pow(0.5 + 0.5 * sin(along * 0.9 - uTime * 3.4 * uFlow), 16.0) * 2.4;

    float drawn = 1.0 - smoothstep(uDraw - 0.03, uDraw, vUv.x);
    float ends = smoothstep(0.0, 0.025, vUv.x) * smoothstep(1.0, 0.94, vUv.x);

    // Broken beams stutter and die away: customers who were never reached.
    float gaps = smoothstep(0.32, 0.5, noise(along * 2.4 + uTime * 0.7));
    float fade = 1.0 - vUv.x;
    float broken = mix(1.0, gaps * fade * fade * (0.65 + 0.35 * sin(uTime * 19.0 + along)), uBroken);

    float alpha = core * ends * drawn * broken * uWeight;
    // Coloured body, with only the very centre running white hot.
    vec3 color = mix(uColor * vec3(5.0, 3.0, 1.6), vec3(7.0, 5.4, 3.0), pow(core, 9.0)) * (energy + packets);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export const flareVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Lens glow and anamorphic streak where the thread meets the hub. */
export const flareFragmentShader = /* glsl */ `
  uniform float uWeight;
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float distanceFromCentre = length(p);
    float falloff = smoothstep(1.0, 0.0, distanceFromCentre);
    float glow = 0.006 / (distanceFromCentre + 0.012) * falloff * falloff;
    float wide = pow(falloff, 5.0) * 0.1;
    float streak = 0.0012 / (abs(p.y) + 0.0025) * pow(smoothstep(1.0, 0.0, abs(p.x)), 2.0) * 0.45;
    float pulse = 0.88 + 0.12 * sin(uTime * 1.4);
    vec3 color = (uColor * (wide + streak) * 1.6 + vec3(5.0, 4.2, 3.0) * glow) * pulse * uWeight;
    gl_FragColor = vec4(color, 1.0);
  }
`;
