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
import { expect, test } from 'vitest';

import {
  computeDrawRect,
  createParticlePool,
  DEFAULT_CONFIG,
  depthScale,
  easePostBendProgress,
  getAtlasCellRect,
  pathX,
  pathY,
  perspectivePathProgress,
  perspectiveSpacingProgress,
  resolveConfig,
  stepParticlePool,
} from './particle-simulation';

const PERSPECTIVE_TEST_CONFIG = {
  ...DEFAULT_CONFIG,
  bendStart: 0.5,
  offscreenMargin: 100,
  perspectiveSpeedExponent: 3,
  perspectiveSpacingExponent: 1,
};

test('resolveConfig returns the desktop defaults for a wide viewport', () => {
  const config = resolveConfig(1920);
  expect(config).toEqual(DEFAULT_CONFIG);
});

test('resolveConfig applies the mobile breakpoint below 768px', () => {
  const config = resolveConfig(320);
  expect(config.particleCount).toBe(DEFAULT_CONFIG.particleCount);
  expect(config.redZoneHeight).toBe(72);
  expect(config.blueZoneHeight).toBe(160);
  expect(config.maxParticleSize).toBe(56);
});

test('resolveConfig applies the tablet breakpoint between 768 and 1280px', () => {
  const config = resolveConfig(900);
  expect(config.particleCount).toBe(DEFAULT_CONFIG.particleCount);
  expect(config.redZoneHeight).toBe(84);
  expect(config.maxParticleSize).toBe(100);
});

test('resolveConfig lets explicit overrides win over the breakpoint', () => {
  const config = resolveConfig(320, { particleCount: 999 });
  expect(config.particleCount).toBe(999);
  // other mobile-breakpoint values are untouched by the override
  expect(config.redZoneHeight).toBe(72);
});

test('perspectivePathProgress is linear when exponent is 1', () => {
  const config = { ...DEFAULT_CONFIG, perspectiveSpeedExponent: 1 };
  expect(perspectivePathProgress(0, config)).toBe(0);
  expect(perspectivePathProgress(0.5, config)).toBe(0.5);
  expect(perspectivePathProgress(1, config)).toBe(1);
});

test('easePostBendProgress is linear when exponent is 2 or less', () => {
  expect(easePostBendProgress(0.5, 2)).toBe(0.5);
  expect(easePostBendProgress(0.5, 1)).toBe(0.5);
});

test('easePostBendProgress starts at unit slope so entry speed matches the pre-bend phase', () => {
  const delta = easePostBendProgress(0.001, 3) - easePostBendProgress(0, 3);
  expect(delta / 0.001).toBeCloseTo(1, 2);
});

test('easePostBendProgress stays ahead of linear progress after the bend starts', () => {
  expect(easePostBendProgress(0.5, 3)).toBeCloseTo(0.625, 5);
  expect(easePostBendProgress(0.5, 3)).toBeGreaterThan(0.5);
});

test('perspectivePathProgress is linear before bendStart even when exponent is greater than 2', () => {
  expect(perspectivePathProgress(0.25, PERSPECTIVE_TEST_CONFIG)).toBe(0.25);
  expect(perspectivePathProgress(PERSPECTIVE_TEST_CONFIG.bendStart, PERSPECTIVE_TEST_CONFIG)).toBe(
    PERSPECTIVE_TEST_CONFIG.bendStart,
  );
});

test('perspectivePathProgress accelerates soon after bendStart when exponent is greater than 2', () => {
  const bendStart = PERSPECTIVE_TEST_CONFIG.bendStart;
  const entryDelta =
    perspectivePathProgress(bendStart + 0.05, PERSPECTIVE_TEST_CONFIG) -
    perspectivePathProgress(bendStart, PERSPECTIVE_TEST_CONFIG);
  const earlyPostBendDelta =
    perspectivePathProgress(bendStart + 0.15, PERSPECTIVE_TEST_CONFIG) -
    perspectivePathProgress(bendStart + 0.1, PERSPECTIVE_TEST_CONFIG);
  expect(earlyPostBendDelta).toBeGreaterThan(entryDelta);
});

test('perspectiveSpacingProgress is linear when exponent is 1', () => {
  expect(perspectiveSpacingProgress(0.5, 1)).toBe(0.5);
});

test('perspectiveSpacingProgress compresses progress on the left when exponent is greater than 1', () => {
  expect(perspectiveSpacingProgress(0.5, 2)).toBe(0.25);
  expect(perspectiveSpacingProgress(0.5, 2)).toBeLessThan(0.5);
});

test('pathHorizontalProgress widens particle gaps toward the right when spacing exponent is greater than 1', () => {
  const config = { ...PERSPECTIVE_TEST_CONFIG, perspectiveSpeedExponent: 1, perspectiveSpacingExponent: 2 };
  const leftGap = pathX(0.2, 1000, config) - pathX(0.1, 1000, config);
  const rightGap = pathX(0.9, 1000, config) - pathX(0.8, 1000, config);
  expect(rightGap).toBeGreaterThan(leftGap);
});

test('pathX maps t linearly when perspectiveSpeedExponent is 1', () => {
  const config = { ...PERSPECTIVE_TEST_CONFIG, perspectiveSpeedExponent: 1 };
  expect(pathX(0, 1000, config)).toBe(-100);
  expect(pathX(0.5, 1000, config)).toBe(500);
  expect(pathX(1, 1000, config)).toBe(1100);
});

test('pathX is linear before bendStart when perspectiveSpeedExponent is greater than 1', () => {
  expect(pathX(0, 1000, PERSPECTIVE_TEST_CONFIG)).toBe(-100);
  expect(pathX(PERSPECTIVE_TEST_CONFIG.bendStart, 1000, PERSPECTIVE_TEST_CONFIG)).toBe(500);
  expect(pathX(1, 1000, PERSPECTIVE_TEST_CONFIG)).toBe(1100);
});

test('pathX moves at constant speed before bendStart when perspectiveSpeedExponent is greater than 2', () => {
  const earlyDelta = pathX(0.2, 1000, PERSPECTIVE_TEST_CONFIG) - pathX(0.1, 1000, PERSPECTIVE_TEST_CONFIG);
  const preBendDelta = pathX(0.4, 1000, PERSPECTIVE_TEST_CONFIG) - pathX(0.3, 1000, PERSPECTIVE_TEST_CONFIG);
  expect(preBendDelta).toBeCloseTo(earlyDelta, 5);
});

test('pathX keeps the same speed when entering the bend phase', () => {
  const bendStart = PERSPECTIVE_TEST_CONFIG.bendStart;
  const preBendDelta =
    pathX(bendStart, 1000, PERSPECTIVE_TEST_CONFIG) - pathX(bendStart - 0.01, 1000, PERSPECTIVE_TEST_CONFIG);
  const postBendDelta =
    pathX(bendStart + 0.01, 1000, PERSPECTIVE_TEST_CONFIG) - pathX(bendStart, 1000, PERSPECTIVE_TEST_CONFIG);
  expect(postBendDelta).toBeCloseTo(preBendDelta, 0);
});

test('pathX accelerates soon after bendStart when perspectiveSpeedExponent is greater than 2', () => {
  const entryDelta = pathX(0.55, 1000, PERSPECTIVE_TEST_CONFIG) - pathX(0.5, 1000, PERSPECTIVE_TEST_CONFIG);
  const earlyPostBendDelta = pathX(0.65, 1000, PERSPECTIVE_TEST_CONFIG) - pathX(0.6, 1000, PERSPECTIVE_TEST_CONFIG);
  expect(earlyPostBendDelta).toBeGreaterThan(entryDelta);
});

test('pathY stays flat before bendStart', () => {
  const flatY = pathY(0, DEFAULT_CONFIG);
  expect(pathY(DEFAULT_CONFIG.bendStart, DEFAULT_CONFIG)).toBe(flatY);
  expect(pathY(0.1, DEFAULT_CONFIG)).toBe(flatY);
});

test('pathY increases monotonically after bendStart', () => {
  const yAtBend = pathY(DEFAULT_CONFIG.bendStart, DEFAULT_CONFIG);
  const yAtThreeQuarters = pathY(0.75, DEFAULT_CONFIG);
  const yAtEnd = pathY(1, DEFAULT_CONFIG);
  expect(yAtThreeQuarters).toBeGreaterThan(yAtBend);
  expect(yAtEnd).toBeGreaterThan(yAtThreeQuarters);
});

test('depthScale is minParticleSize before bendStart and maxParticleSize at t=1', () => {
  expect(depthScale(0, DEFAULT_CONFIG)).toBe(DEFAULT_CONFIG.minParticleSize);
  expect(depthScale(DEFAULT_CONFIG.bendStart, DEFAULT_CONFIG)).toBe(DEFAULT_CONFIG.minParticleSize);
  expect(depthScale(1, DEFAULT_CONFIG)).toBe(DEFAULT_CONFIG.maxParticleSize);
});

test('depthScale increases monotonically after bendStart', () => {
  const a = depthScale(0.6, DEFAULT_CONFIG);
  const b = depthScale(0.8, DEFAULT_CONFIG);
  const c = depthScale(1, DEFAULT_CONFIG);
  expect(b).toBeGreaterThan(a);
  expect(c).toBeGreaterThan(b);
});

test('getAtlasCellRect maps index 0 to the top-left cell', () => {
  expect(getAtlasCellRect(0, DEFAULT_CONFIG)).toEqual({ sx: 0, sy: 0, sw: 256, sh: 256 });
});

test('getAtlasCellRect maps index 3 to the last column of the first row', () => {
  expect(getAtlasCellRect(3, DEFAULT_CONFIG)).toEqual({ sx: 768, sy: 0, sw: 256, sh: 256 });
});

test('getAtlasCellRect wraps to the next row at the grid width', () => {
  expect(getAtlasCellRect(4, DEFAULT_CONFIG)).toEqual({ sx: 0, sy: 256, sw: 256, sh: 256 });
});

test('getAtlasCellRect wraps indices past spriteVariantCount back into range', () => {
  // spriteVariantCount is 10, so index 15 wraps to index 5 -> column 1, row 1
  expect(getAtlasCellRect(15, DEFAULT_CONFIG)).toEqual({ sx: 256, sy: 256, sw: 256, sh: 256 });
});

test('getAtlasCellRect wraps negative indices into range', () => {
  // -1 wraps to spriteVariantCount - 1 = 9 -> column 1, row 2
  expect(getAtlasCellRect(-1, DEFAULT_CONFIG)).toEqual({ sx: 256, sy: 512, sw: 256, sh: 256 });
});

test('createParticlePool spreads initial t values evenly across the path', () => {
  const pool = createParticlePool(4, 10);
  expect(Array.from(pool.t)).toEqual([0, 0.25, 0.5, 0.75]);
});

test('createParticlePool assigns sprite indices using the injected rng', () => {
  const pool = createParticlePool(3, 10, () => 0.95);
  // floor(0.95 * 10) = 9 for every particle, since the rng is fixed
  expect(Array.from(pool.spriteIndex)).toEqual([9, 9, 9]);
});

test('stepParticlePool advances t by deltaSeconds / travelDurationSeconds', () => {
  const pool = createParticlePool(2, 10, () => 0);
  stepParticlePool(pool, 1, 10); // 1s of a 10s travel duration = 0.1 progress
  expect(pool.t[0]).toBeCloseTo(0.1, 5);
  expect(pool.t[1]).toBeCloseTo(0.6, 5);
});

test('stepParticlePool wraps t back into [0, 1) at the end of the path', () => {
  const pool = createParticlePool(1, 10, () => 0);
  pool.t[0] = 0.95;
  stepParticlePool(pool, 1, 10); // advances by 0.1, 0.95 + 0.1 = 1.05 -> wraps to 0.05
  expect(pool.t[0]).toBeCloseTo(0.05, 5);
});

test('computeDrawRect centers the sprite on the path point (center pivot)', () => {
  const rect = computeDrawRect(1, 1000, DEFAULT_CONFIG);
  const expectedSize = depthScale(1, DEFAULT_CONFIG);
  const expectedCenterX = pathX(1, 1000, DEFAULT_CONFIG);
  const expectedCenterY = pathY(1, DEFAULT_CONFIG);
  expect(rect.size).toBe(expectedSize);
  expect(rect.x).toBeCloseTo(expectedCenterX - expectedSize / 2, 5);
  expect(rect.y).toBeCloseTo(expectedCenterY - expectedSize / 2, 5);
});

test('computeDrawRect matches manual math at a known point', () => {
  const rect = computeDrawRect(0, 1000, PERSPECTIVE_TEST_CONFIG);
  // t=0: size is minParticleSize, x starts off-screen left by offscreenMargin
  const size = PERSPECTIVE_TEST_CONFIG.minParticleSize;
  expect(rect.size).toBe(size);
  expect(rect.x).toBeCloseTo(-PERSPECTIVE_TEST_CONFIG.offscreenMargin - size / 2, 5);
  expect(rect.y).toBeCloseTo(PERSPECTIVE_TEST_CONFIG.redZoneHeight / 2 - size / 2, 5);
});
