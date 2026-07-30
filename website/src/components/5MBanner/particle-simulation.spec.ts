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
  getAtlasCellRect,
  pathX,
  pathY,
  resolveConfig,
  stepParticlePool,
} from './particle-simulation';

test('resolveConfig returns the desktop defaults for a wide viewport', () => {
  const config = resolveConfig(1920);
  expect(config).toEqual(DEFAULT_CONFIG);
});

test('resolveConfig applies the mobile breakpoint below 768px', () => {
  const config = resolveConfig(320);
  expect(config.particleCount).toBe(150);
  expect(config.redZoneHeight).toBe(72);
  expect(config.blueZoneHeight).toBe(160);
  expect(config.maxParticleSize).toBe(56);
});

test('resolveConfig applies the tablet breakpoint between 768 and 1280px', () => {
  const config = resolveConfig(900);
  expect(config.particleCount).toBe(260);
  expect(config.redZoneHeight).toBe(84);
});

test('resolveConfig lets explicit overrides win over the breakpoint', () => {
  const config = resolveConfig(320, { particleCount: 999 });
  expect(config.particleCount).toBe(999);
  // other mobile-breakpoint values are untouched by the override
  expect(config.redZoneHeight).toBe(72);
});

test('pathX maps t linearly across the viewport width', () => {
  expect(pathX(0, 1000)).toBe(0);
  expect(pathX(0.5, 1000)).toBe(500);
  expect(pathX(1, 1000)).toBe(1000);
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
  const expectedCenterX = pathX(1, 1000);
  const expectedCenterY = pathY(1, DEFAULT_CONFIG);
  expect(rect.size).toBe(expectedSize);
  expect(rect.x).toBeCloseTo(expectedCenterX - expectedSize / 2, 5);
  expect(rect.y).toBeCloseTo(expectedCenterY - expectedSize / 2, 5);
});

test('computeDrawRect matches manual math at a known point', () => {
  const rect = computeDrawRect(0, 1000, DEFAULT_CONFIG);
  // t=0: size is minParticleSize, x is 0 - size/2, y is redZoneHeight/2 - size/2
  const size = DEFAULT_CONFIG.minParticleSize;
  expect(rect.size).toBe(size);
  expect(rect.x).toBeCloseTo(0 - size / 2, 5);
  expect(rect.y).toBeCloseTo(DEFAULT_CONFIG.redZoneHeight / 2 - size / 2, 5);
});
