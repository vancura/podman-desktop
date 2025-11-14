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

import type { BrowserWindow } from 'electron';

import { ScreenshotManager } from './ScreenshotManager.js';
import { ThemeLoader } from './ThemeLoader.js';
import type { Platform, ScreenshotOptions, Theme } from './types.js';

export class ScreenshotTool {
  private themeLoader: ThemeLoader;
  private screenshotManager: ScreenshotManager | undefined;

  constructor() {
    console.log('[ScreenshotTool] Constructor called');
    this.themeLoader = new ThemeLoader();
    console.log('[ScreenshotTool] ThemeLoader created');
  }

  init(mainWindow: BrowserWindow): void {
    console.log('[ScreenshotTool] init() called');
    this.screenshotManager = new ScreenshotManager(mainWindow, this.themeLoader);
    console.log('[ScreenshotTool] ScreenshotManager created');
  }

  async captureScreenshot(options: ScreenshotOptions): Promise<Buffer> {
    if (!this.screenshotManager) {
      throw new Error('Screenshot manager not initialized. Call init() first.');
    }

    return this.screenshotManager.captureScreenshot(options);
  }

  getAllThemes(): Theme[] {
    const themes = this.themeLoader.getAllThemes();
    console.log('[ScreenshotTool] getAllThemes() returning:', themes.length, 'themes');
    return themes;
  }

  getAllPlatforms(): Platform[] {
    const platforms = this.themeLoader.getAllPlatforms();
    console.log('[ScreenshotTool] getAllPlatforms() returning:', platforms.length, 'platforms');
    return platforms;
  }

  getPlatformsByCategory(): Map<string, Platform[]> {
    return this.themeLoader.getPlatformsByCategory();
  }

  validatePlatformSize(platformId: string): { valid: boolean; warning?: string } {
    if (!this.screenshotManager) {
      throw new Error('Screenshot manager not initialized. Call init() first.');
    }

    return this.screenshotManager.validatePlatformSize(platformId);
  }

  generateFilename(options: ScreenshotOptions): string {
    if (!this.screenshotManager) {
      throw new Error('Screenshot manager not initialized. Call init() first.');
    }

    return this.screenshotManager.generateFilename(options);
  }
}

// Export types
export type { Platform, ScreenshotOptions, Theme } from './types.js';
