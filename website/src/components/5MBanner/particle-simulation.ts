/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

export interface FiveMillionBannerConfig {
  /** Atlas grid columns/rows (square grid – 4 means a 4x4, 16-cell atlas). */
  atlasGridSize: number;
  /** Pixel size of one atlas cell in the source image. */
  atlasCellSize: number;
  /** How many atlas cells (starting at index 0) are valid sprite variants. */
  spriteVariantCount: number;
  /** Number of particles in the pool. */
  particleCount: number;
  /** Height, in CSS px, of the opaque top ("red") zone. */
  redZoneHeight: number;
  /** Height, in CSS px, of the transparent bottom ("blue") zone. */
  blueZoneHeight: number;
  /** Rendered size, in CSS px, of the smallest/farthest particles. */
  minParticleSize: number;
  /** Rendered size, in CSS px, of the largest/nearest particles, at t = 1. */
  maxParticleSize: number;
  /** Progress (0-1) at which the path starts bending toward the viewer. */
  bendStart: number;
  /** How far, in CSS px, the largest particles may intrude into the blue zone. */
  maxBlueZoneIntrusion: number;
  /** Seconds for a particle to travel the full path before wrapping (t: 0 -> 1). */
  travelDurationSeconds: number;
}

export const DEFAULT_CONFIG: FiveMillionBannerConfig = {
  atlasGridSize: 4,
  atlasCellSize: 256,
  spriteVariantCount: 10,
  particleCount: 400,
  redZoneHeight: 96,
  blueZoneHeight: 260,
  minParticleSize: 12,
  maxParticleSize: 96,
  bendStart: 0.5,
  maxBlueZoneIntrusion: 80,
  travelDurationSeconds: 14,
};

interface Breakpoint {
  minWidth: number;
  overrides: Partial<FiveMillionBannerConfig>;
}

// Numeric values below are a visual-tuning starting point, not final –
// see the design spec's "Responsive behavior" section.
const BREAKPOINTS: Breakpoint[] = [
  { minWidth: 0, overrides: { particleCount: 150, redZoneHeight: 72, blueZoneHeight: 160, maxParticleSize: 56 } },
  { minWidth: 768, overrides: { particleCount: 260, redZoneHeight: 84, blueZoneHeight: 210, maxParticleSize: 76 } },
  { minWidth: 1280, overrides: {} },
];

export function resolveConfig(
  viewportWidth: number,
  overrides: Partial<FiveMillionBannerConfig> = {},
): FiveMillionBannerConfig {
  const breakpoint = [...BREAKPOINTS].reverse().find(bp => viewportWidth >= bp.minWidth) ?? BREAKPOINTS[0];
  return { ...DEFAULT_CONFIG, ...breakpoint.overrides, ...overrides };
}

function easeInCubic(x: number): number {
  return x * x * x;
}

export function pathX(t: number, viewportWidth: number): number {
  return t * viewportWidth;
}

export function pathY(t: number, config: FiveMillionBannerConfig): number {
  const baseline = config.redZoneHeight / 2;
  if (t <= config.bendStart) {
    return baseline;
  }
  const bendProgress = (t - config.bendStart) / (1 - config.bendStart);
  const maxDrop = config.redZoneHeight / 2 + config.maxBlueZoneIntrusion;
  return baseline + easeInCubic(bendProgress) * maxDrop;
}

export function depthScale(t: number, config: FiveMillionBannerConfig): number {
  if (t <= config.bendStart) {
    return config.minParticleSize;
  }
  const bendProgress = (t - config.bendStart) / (1 - config.bendStart);
  return config.minParticleSize + easeInCubic(bendProgress) * (config.maxParticleSize - config.minParticleSize);
}
