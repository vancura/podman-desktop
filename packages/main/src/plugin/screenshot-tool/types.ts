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

export interface Platform {
  id: string;
  name: string;
  category: string;
  width: number | null;
  height: number | null;
  description: string;
}

export interface PlatformConfig {
  platforms: Platform[];
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  background: {
    type: 'image' | 'solid' | 'gradient';
    image?: string;
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      angle?: number;
    };
  };
  window: {
    shadow: {
      x: number;
      y: number;
      blur: number;
      spread: number;
      opacity: number;
      color: string;
    };
    border: {
      radius: number;
      width: number;
      color: string;
    };
    chrome: 'frameless' | 'macos' | 'neutral';
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ScreenshotOptions {
  platformId: string;
  themeId: string;
  appearance: 'light' | 'dark';
  format: 'avif' | 'webp' | 'png' | 'jpeg';
}

export interface ScreenshotResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}
