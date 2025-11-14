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

import type { BrowserWindow, NativeImage } from 'electron';
import { screen } from 'electron';

import { ImageProcessor } from './ImageProcessor.js';
import type { Platform, ScreenshotOptions, Theme } from './types.js';

export class ScreenshotManager {
  private originalWindowSize: { width: number; height: number } | undefined;

  constructor(
    private mainWindow: BrowserWindow,
    private themeLoader: { getTheme: (id: string) => Theme | undefined; getPlatform: (id: string) => Platform | undefined },
  ) {}

  async captureScreenshot(options: ScreenshotOptions): Promise<Buffer> {
    try {
      // 1. Store current state
      this.storeCurrentState();

      // 2. Apply configuration
      await this.applyConfiguration(options);

      // 3. Wait for stabilization
      await this.waitForStabilization(300);

      // 4. Capture at HiDPI
      const image = await this.captureWindow();

      // 5. Process image
      const processedImage = await this.processImage(image, options);

      // 6. Restore original state
      await this.restoreOriginalState();

      return processedImage;
    } catch (error) {
      // Ensure restoration even on error
      await this.restoreOriginalState();
      throw error;
    }
  }

  private storeCurrentState(): void {
    const bounds = this.mainWindow.getBounds();
    this.originalWindowSize = { width: bounds.width, height: bounds.height };
  }

  private async applyConfiguration(options: ScreenshotOptions): Promise<void> {
    const platform = this.themeLoader.getPlatform(options.platformId);

    if (!platform) {
      throw new Error(`Platform not found: ${options.platformId}`);
    }

    // Resize window if not "any"
    if (platform.width && platform.height) {
      this.mainWindow.setSize(platform.width, platform.height);
      await this.waitForStabilization(100); // Wait for window stabilization
    }

    // Blur any focused elements
    await this.mainWindow.webContents.executeJavaScript(`
      if (document.activeElement) {
        document.activeElement.blur();
      }
    `);
  }

  private async captureWindow(): Promise<NativeImage> {
    // Capture at native resolution (automatically handles HiDPI)
    const image = await this.mainWindow.capturePage();
    return image;
  }

  private async processImage(image: NativeImage, options: ScreenshotOptions): Promise<Buffer> {
    const theme = this.themeLoader.getTheme(options.themeId);

    if (!theme) {
      throw new Error(`Theme not found: ${options.themeId}`);
    }

    const processor = new ImageProcessor(theme);
    return processor.process(image, options.format);
  }

  async restoreOriginalState(): Promise<void> {
    if (this.originalWindowSize) {
      this.mainWindow.setSize(this.originalWindowSize.width, this.originalWindowSize.height);
      this.originalWindowSize = undefined;
    }
  }

  private async waitForStabilization(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  validatePlatformSize(platformId: string): { valid: boolean; warning?: string } {
    const platform = this.themeLoader.getPlatform(platformId);

    if (!platform) {
      return { valid: false, warning: 'Platform not found' };
    }

    // If platform is "any", no validation needed
    if (!platform.width || !platform.height) {
      return { valid: true };
    }

    const display = screen.getPrimaryDisplay();
    const screenSize = display.workAreaSize;

    if (platform.width > screenSize.width || platform.height > screenSize.height) {
      return {
        valid: false,
        warning: `Selected size (${platform.width}x${platform.height}) exceeds your screen size (${screenSize.width}x${screenSize.height}). Results may be unexpected.`,
      };
    }

    return { valid: true };
  }

  generateFilename(options: ScreenshotOptions): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-mm-ss
    const platform = options.platformId.replace(/-/g, '');
    const ext = options.format;

    // For MVP, we'll use a simple "app" as the view name
    // In the future, this could be detected from the current route
    const view = 'app';

    return `podman-desktop-${view}-${platform}-${date}-${time}.${ext}`;
  }
}
