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

import type { NativeImage } from 'electron';
import sharp from 'sharp';

import type { Theme } from './types.js';

export class ImageProcessor {
  constructor(private theme: Theme) {}

  async process(screenshot: NativeImage, format: 'avif' | 'webp' | 'png' | 'jpeg'): Promise<Buffer> {
    const screenshotBuffer = screenshot.toPNG();
    const screenshotImage = sharp(screenshotBuffer);
    const metadata = await screenshotImage.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Failed to get screenshot dimensions');
    }

    // Calculate final canvas dimensions
    const finalWidth = metadata.width + this.theme.padding.left + this.theme.padding.right;
    const finalHeight = metadata.height + this.theme.padding.top + this.theme.padding.bottom;

    // Create background
    const background = await this.createBackground(finalWidth, finalHeight);

    // Create shadow layer
    const shadow = await this.createShadow(metadata.width, metadata.height);

    // Apply border/corner radius to screenshot
    const borderedScreenshot = await this.applyBorder(screenshotBuffer, metadata.width, metadata.height);

    // Composite all layers
    const composite = sharp({
      create: {
        width: finalWidth,
        height: finalHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });

    const layers = [
      // Background layer
      { input: background, top: 0, left: 0 },

      // Shadow layer
      {
        input: shadow,
        top: this.theme.padding.top + this.theme.window.shadow.y,
        left: this.theme.padding.left + this.theme.window.shadow.x,
      },

      // Screenshot with border
      {
        input: borderedScreenshot,
        top: this.theme.padding.top,
        left: this.theme.padding.left,
      },
    ];

    // Apply format-specific optimization
    let output = composite.composite(layers);

    switch (format) {
      case 'avif':
        output = output.avif({ quality: 85, effort: 4 });
        break;
      case 'webp':
        output = output.webp({ quality: 90, effort: 4 });
        break;
      case 'png':
        output = output.png({ compressionLevel: 9 });
        break;
      case 'jpeg':
        output = output.jpeg({ quality: 90, mozjpeg: true });
        break;
    }

    const finalBuffer = await output.toBuffer();
    return finalBuffer;
  }

  private async createBackground(width: number, height: number): Promise<Buffer> {
    if (this.theme.background.type === 'solid') {
      // Create solid color background
      const color = this.hexToRgb(this.theme.background.color!);
      return sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { ...color, alpha: 1 },
        },
      })
        .png()
        .toBuffer();
    } else if (this.theme.background.type === 'gradient') {
      // Generate SVG gradient and rasterize
      const svg = this.generateGradientSVG(width, height, this.theme.background.gradient!);
      return sharp(Buffer.from(svg)).png().toBuffer();
    } else if (this.theme.background.type === 'image' && this.theme.background.image) {
      // Load and resize background image
      return sharp(this.theme.background.image).resize(width, height, { fit: 'cover' }).png().toBuffer();
    }

    // Fallback to transparent
    return sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();
  }

  private async createShadow(width: number, height: number): Promise<Buffer> {
    const shadow = this.theme.window.shadow;

    // Create shadow with spread
    const shadowWidth = width + shadow.spread * 2;
    const shadowHeight = height + shadow.spread * 2;

    const color = this.hexToRgb(shadow.color);
    const alpha = Math.round(shadow.opacity * 255);

    // Create base shadow rectangle
    const shadowRect = sharp({
      create: {
        width: shadowWidth,
        height: shadowHeight,
        channels: 4,
        background: { ...color, alpha },
      },
    });

    // Apply blur if specified
    if (shadow.blur > 0) {
      return shadowRect.blur(shadow.blur / 2).png().toBuffer();
    }

    return shadowRect.png().toBuffer();
  }

  private async applyBorder(imageBuffer: Buffer, width: number, height: number): Promise<Buffer> {
    const borderRadius = this.theme.window.border.radius;
    const borderWidth = this.theme.window.border.width;

    let image = sharp(imageBuffer);

    // Apply corner radius using SVG mask
    if (borderRadius > 0) {
      const mask = Buffer.from(
        `<svg width="${width}" height="${height}">
          <rect x="0" y="0" width="${width}" height="${height}"
                rx="${borderRadius}" ry="${borderRadius}" fill="white"/>
        </svg>`,
      );

      const maskImage = await sharp(mask).png().toBuffer();

      image = sharp(imageBuffer).composite([
        {
          input: maskImage,
          blend: 'dest-in',
        },
      ]);
    }

    // Apply border if specified
    if (borderWidth > 0) {
      const borderColor = this.hexToRgb(this.theme.window.border.color);
      const borderSvg = Buffer.from(
        `<svg width="${width}" height="${height}">
          <rect x="${borderWidth / 2}" y="${borderWidth / 2}"
                width="${width - borderWidth}" height="${height - borderWidth}"
                rx="${borderRadius}" ry="${borderRadius}"
                fill="none" stroke="rgb(${borderColor.r},${borderColor.g},${borderColor.b})"
                stroke-width="${borderWidth}"/>
        </svg>`,
      );

      const borderImage = await sharp(borderSvg).png().toBuffer();

      return image
        .composite([
          {
            input: borderImage,
            blend: 'over',
          },
        ])
        .png()
        .toBuffer();
    }

    return image.png().toBuffer();
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  private generateGradientSVG(
    width: number,
    height: number,
    gradient: NonNullable<Theme['background']['gradient']>,
  ): string {
    if (gradient.type === 'linear') {
      const angle = gradient.angle || 0;
      const stops = gradient.colors
        .map((color, i) => {
          const offset = (i / (gradient.colors.length - 1)) * 100;
          return `<stop offset="${offset}%" stop-color="${color}"/>`;
        })
        .join('\n');

      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" gradientTransform="rotate(${angle} 0.5 0.5)">
              ${stops}
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)"/>
        </svg>
      `;
    } else if (gradient.type === 'radial') {
      const stops = gradient.colors
        .map((color, i) => {
          const offset = (i / (gradient.colors.length - 1)) * 100;
          return `<stop offset="${offset}%" stop-color="${color}"/>`;
        })
        .join('\n');

      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="grad">
              ${stops}
            </radialGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)"/>
        </svg>
      `;
    }

    // Fallback
    return `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#ffffff"/></svg>`;
  }
}
