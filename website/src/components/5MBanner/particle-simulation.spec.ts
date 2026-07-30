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

import { DEFAULT_CONFIG, resolveConfig } from './particle-simulation';

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
