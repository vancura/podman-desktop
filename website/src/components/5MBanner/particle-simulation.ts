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

/** Baseline config, for viewports >= 1280px. BREAKPOINTS below override a subset of these fields for narrower widths. */
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

/** Represents a breakpoint (min width and config overrides) for the 5M banner particle simulation. */
interface Breakpoint {
  /** Minimum viewport width (inclusive) at which this breakpoint applies. */
  minWidth: number;

  /** Config overrides for this breakpoint. */
  overrides: Partial<FiveMillionBannerConfig>;
}

// Numeric values below are a visual-tuning starting point, not final –
// see the design spec's "Responsive behavior" section.
const BREAKPOINTS: Breakpoint[] = [
  { minWidth: 0, overrides: { particleCount: 150, redZoneHeight: 72, blueZoneHeight: 160, maxParticleSize: 56 } },
  { minWidth: 768, overrides: { particleCount: 260, redZoneHeight: 84, blueZoneHeight: 210, maxParticleSize: 76 } },
  { minWidth: 1280, overrides: {} },
];

/**
 * Resolves the config for a given viewport width: starts from DEFAULT_CONFIG, applies the
 * widest matching breakpoint's overrides, then applies the caller-supplied overrides on top.
 */
export function resolveConfig(
  viewportWidth: number,
  overrides: Partial<FiveMillionBannerConfig> = {},
): FiveMillionBannerConfig {
  const breakpoint = [...BREAKPOINTS].reverse().find(bp => viewportWidth >= bp.minWidth) ?? BREAKPOINTS[0];
  return { ...DEFAULT_CONFIG, ...breakpoint.overrides, ...overrides };
}

/** Cubic ease-in: maps 0-1 to 0-1, starting slow and accelerating toward the end. */
function easeInCubic(x: number): number {
  return x * x * x;
}

// Progress (0-1) through the post-bend portion of the path, used to ease
// both the vertical drop (pathY) and the size ramp (depthScale) in lockstep.
function bendProgress(t: number, config: FiveMillionBannerConfig): number {
  return (t - config.bendStart) / (1 - config.bendStart);
}

/** Horizontal position, in CSS px, of a particle at path progress t (0-1): a straight left-to-right sweep. */
export function pathX(t: number, viewportWidth: number): number {
  return t * viewportWidth;
}

/**
 * Vertical position, in CSS px, of a particle at path progress t. Flat at the red zone's
 * midline until config.bendStart, then eases downward, intruding up to maxBlueZoneIntrusion
 * px into the blue zone by t = 1.
 */
export function pathY(t: number, config: FiveMillionBannerConfig): number {
  const baseline = config.redZoneHeight / 2;

  if (t <= config.bendStart) {
    return baseline; // particles stay flat until the bend starts
  }

  // particles bend downwards, intruding into the blue zone as they approach the viewer
  const maxDrop = config.redZoneHeight / 2 + config.maxBlueZoneIntrusion;
  return baseline + easeInCubic(bendProgress(t, config)) * maxDrop;
}

/**
 * Rendered particle size, in CSS px, at path progress t: constant at minParticleSize until
 * config.bendStart, then eases up to maxParticleSize by t = 1, so particles appear to grow
 * as they approach the viewer.
 */
export function depthScale(t: number, config: FiveMillionBannerConfig): number {
  if (t <= config.bendStart) {
    return config.minParticleSize;
  }

  return (
    config.minParticleSize + easeInCubic(bendProgress(t, config)) * (config.maxParticleSize - config.minParticleSize)
  );
}

/** A source rect in the sprite atlas image, in the same sx/sy/sw/sh shape CanvasRenderingContext2D.drawImage takes. */
export interface AtlasRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * Looks up the source rect, in atlas pixel coordinates, for a sprite variant. Wraps
 * spriteIndex into [0, config.spriteVariantCount) first, so any integer -- including
 * negative or out-of-range values -- maps to a valid cell.
 */
export function getAtlasCellRect(spriteIndex: number, config: FiveMillionBannerConfig): AtlasRect {
  const index = ((spriteIndex % config.spriteVariantCount) + config.spriteVariantCount) % config.spriteVariantCount;
  const column = index % config.atlasGridSize;
  const row = Math.floor(index / config.atlasGridSize);

  return {
    sx: column * config.atlasCellSize,
    sy: row * config.atlasCellSize,
    sw: config.atlasCellSize,
    sh: config.atlasCellSize,
  };
}

/** A fixed-size set of particles, stored as parallel arrays rather than an array of objects. */
export interface ParticlePool {
  /** Number of particles; the valid length of the t and spriteIndex arrays below. */
  readonly count: number;

  /** Per-particle progress (0-1) along the path; wraps back to 0 on reaching 1. */
  readonly t: Float32Array;

  /** Per-particle atlas sprite variant, assigned once at creation and fixed for the pool's lifetime. */
  readonly spriteIndex: Uint8Array;
}

/** Creates a pool with t values spread evenly across [0, 1) and a random sprite variant per particle. */
export function createParticlePool(
  count: number,
  spriteVariantCount: number,
  rng: () => number = Math.random,
): ParticlePool {
  const t = new Float32Array(count);
  const spriteIndex = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    // Spread evenly rather than starting all at 0, so the very first
    // rendered frame (including the reduced-motion static frame) is
    // already fully populated instead of clumped at the left edge.
    t[i] = i / count;
    spriteIndex[i] = Math.floor(rng() * spriteVariantCount);
  }

  return { count, t, spriteIndex };
}

/** Advances every particle's t in place by deltaSeconds / travelDurationSeconds, wrapping past 1 back to 0. */
export function stepParticlePool(pool: ParticlePool, deltaSeconds: number, travelDurationSeconds: number): void {
  const advance = deltaSeconds / travelDurationSeconds;

  for (let i = 0; i < pool.count; i++) {
    let next = pool.t[i] + advance;

    if (next >= 1) {
      next -= 1;
    }

    pool.t[i] = next;
  }
}

/** A square draw target, in CSS px, in the same x/y/width/height shape CanvasRenderingContext2D.drawImage takes. */
export interface DrawRect {
  /** Left edge, already offset so the sprite is centered on the path point rather than anchored to it. */
  x: number;

  /** Top edge, already offset so the sprite is centered on the path point rather than anchored to it. */
  y: number;

  /** Width and height (the sprite is always square). */
  size: number;
}

/** Composes pathX/pathY/depthScale into a draw rect for a particle at path progress t. */
export function computeDrawRect(t: number, viewportWidth: number, config: FiveMillionBannerConfig): DrawRect {
  const size = depthScale(t, config);
  const centerX = pathX(t, viewportWidth);
  const centerY = pathY(t, config);

  return {
    x: centerX - size / 2,
    y: centerY - size / 2,
    size,
  };
}
