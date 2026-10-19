import { buildEffect } from "https://esm.sh/@owlbear-rodeo/sdk@3";

export const CHANNEL = "com.fire-extension/flash";
export const ACCEPT_KEY = "com.fire-extension/accept-flash";
export const DURATION_MS = 1400;

export const STYLES = {
  red:   { x: 1.0, y: 0.10, z: 0.05 },
  white: { x: 1.0, y: 1.0,  z: 1.0  },
  blue:  { x: 0.3, y: 0.5,  z: 1.0  },
};

// Вспышка на весь экран: красная заливка, тёмная виньетка, полосы-помехи и зерно.
// progress идёт от 0 до 1 и обновляется снаружи, пока вспышка играет.
export const FLASH_SKSL = `
uniform vec2 size;
uniform mat3 view;
uniform float progress;
uniform vec3 tint;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

half4 main(float2 coord) {
  vec2 viewCoord = (vec3(coord, 1) * view).xy;
  vec2 uv = viewCoord / size;
  float p = progress;

  float attack = smoothstep(0.0, 0.05, p);
  float decay = pow(clamp(1.0 - (p - 0.05) / 0.95, 0.0, 1.0), 2.0);
  float env = attack * decay;

  vec2 c = uv * 2.0 - 1.0;
  float vig = smoothstep(0.35, 1.5, length(c));

  float tick = floor(p * 24.0);
  float band = floor(uv.y * 28.0 + tick * 7.0);
  float glitch = step(0.82, hash(vec2(band, tick)));
  float bandK = 0.4 + 0.6 * hash(vec2(band, tick + 3.0));
  float grain = hash(floor(viewCoord / 3.0) + tick * 13.0);

  vec3 flashCol = mix(tint, vec3(1.0), 0.35);
  vec3 dark = tint * 0.2;
  vec3 stripe = mix(tint, vec3(1.0), 0.7);

  float aFlash = 0.55 * env;
  float aVig = 0.9 * vig * env;
  float aGlitch = glitch * 0.6 * bandK * env;

  vec3 rgb = flashCol * aFlash;
  float a = aFlash;
  rgb = dark * aVig + rgb * (1.0 - aVig);
  a = aVig + a * (1.0 - aVig);
  rgb = stripe * aGlitch + rgb * (1.0 - aGlitch);
  a = aGlitch + a * (1.0 - aGlitch);

  float k = 0.9 + 0.2 * grain;
  return half4(rgb * k, clamp(a * k, 0.0, 1.0));
}
`;

export function makeFlash(color) {
  return buildEffect()
    .effectType("VIEWPORT")
    .sksl(FLASH_SKSL)
    .uniforms([
      { name: "progress", value: 0 },
      { name: "tint", value: STYLES[color] || STYLES.red },
    ])
    .locked(true)
    .disableHit(true)
    .metadata({ "com.fire-extension/flash-item": true })
    .build();
}
