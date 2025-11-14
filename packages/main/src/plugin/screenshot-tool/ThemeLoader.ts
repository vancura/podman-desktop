/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Platform, PlatformConfig, Theme } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ThemeLoader {
  private themes: Map<string, Theme> = new Map();
  private platforms: Map<string, Platform> = new Map();
  private themesDir: string;
  private platformsFile: string;

  constructor() {
    this.themesDir = path.join(__dirname, 'themes');
    this.platformsFile = path.join(__dirname, 'platforms.json');
    this.loadThemes();
    this.loadPlatforms();
  }

  private loadThemes(): void {
    const themeFiles = ['default.json', 'minimal.json', 'halloween.json', 'red-hat-summit.json'];

    for (const file of themeFiles) {
      try {
        const themePath = path.join(this.themesDir, file);
        const themeData = fs.readFileSync(themePath, 'utf-8');
        const theme = JSON.parse(themeData) as Theme;
        this.themes.set(theme.id, theme);
      } catch (error) {
        console.error(`Failed to load theme ${file}:`, error);
      }
    }
  }

  private loadPlatforms(): void {
    try {
      const platformData = fs.readFileSync(this.platformsFile, 'utf-8');
      const config = JSON.parse(platformData) as PlatformConfig;

      for (const platform of config.platforms) {
        this.platforms.set(platform.id, platform);
      }
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
  }

  getTheme(themeId: string): Theme | undefined {
    return this.themes.get(themeId);
  }

  getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  getPlatform(platformId: string): Platform | undefined {
    return this.platforms.get(platformId);
  }

  getAllPlatforms(): Platform[] {
    return Array.from(this.platforms.values());
  }

  getPlatformsByCategory(): Map<string, Platform[]> {
    const byCategory = new Map<string, Platform[]>();

    for (const platform of this.platforms.values()) {
      const category = platform.category;
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(platform);
    }

    return byCategory;
  }
}
