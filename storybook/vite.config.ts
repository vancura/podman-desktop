/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

/* eslint-env node */
import { join } from 'node:path';
import * as path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chokidar from 'chokidar';

import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

let filename = fileURLToPath(import.meta.url);
const PACKAGE_ROOT = path.dirname(filename);
const ROOT_DIR = path.join(PACKAGE_ROOT, '..');

interface FileWatcherOptions {
  /** Plugin name, also used as the log prefix. */
  name: string;
  /** Paths (or globs) passed to chokidar. */
  paths: string | string[];
  /** Paths chokidar should ignore. */
  ignored?: string | string[];
  /** Shell command to run (from ROOT_DIR) whenever a watched file changes. */
  command: string;
  /** When set, Vite modules whose file path includes this substring are invalidated before the reload. */
  invalidatePattern?: string;
}

/**
 * Vite plugin factory that watches a set of files and re-runs a build command on change,
 * then triggers a full reload. Rapid changes are coalesced so the command runs at most once
 * at a time, with at most one more queued run afterwards.
 */
function createFileWatcher({ name, paths, ignored, command, invalidatePattern }: FileWatcherOptions) {
  let isBusy = false;
  let queued = false;

  async function run(server: import('vite').ViteDevServer): Promise<void> {
    try {
      await execAsync(command, { cwd: ROOT_DIR });
      console.log(`[${name}] Rebuilt successfully\n`);

      if (invalidatePattern) {
        for (const mod of server.moduleGraph.idToModuleMap.values()) {
          if (mod.file?.includes(invalidatePattern)) {
            server.moduleGraph.invalidateModule(mod);
          }
        }
      }

      server.ws.send({
        type: 'full-reload',
        path: '*',
      });
    } catch (error: unknown) {
      console.error(`[${name}] Rebuild failed:`, error instanceof Error ? error.message : String(error));
    }
  }

  return {
    name,
    configureServer(server: import('vite').ViteDevServer): void {
      if (process.env['VITEST']) return;

      const watcher = chokidar.watch(paths, {
        persistent: true,
        ignoreInitial: true,
        ignored,
      });

      watcher.on('change', async changedFile => {
        if (isBusy) {
          queued = true;
          return;
        }
        isBusy = true;

        console.log(`\n[${name}] ${path.basename(changedFile)} changed, rebuilding...`);
        await run(server);

        while (queued) {
          queued = false;
          console.log(`[${name}] Processing queued change...`);
          await run(server);
        }

        isBusy = false;
      });

      server.httpServer?.on('close', () => {
        watcher.close();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env['MODE'],
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
    },
  },
  plugins: [
    tailwindcss(),
    svelte({ configFile: '../svelte.config.js' }),
    svelteTesting(),
    createFileWatcher({
      name: 'color-registry-watcher',
      paths: [
        path.join(ROOT_DIR, 'packages/main/src/plugin/color-registry.ts'),
        path.join(ROOT_DIR, 'tailwind-color-palette.json'),
      ],
      command: 'pnpm run storybook:css',
    }),
    createFileWatcher({
      name: 'ui-package-watcher',
      paths: path.join(ROOT_DIR, 'packages/ui/src/lib'),
      ignored: ['**/*.spec.ts', '**/*.test.ts'],
      command: 'pnpm --filter @podman-desktop/ui-svelte build',
      invalidatePattern: 'packages/ui/dist',
    }),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    environment: 'jsdom',
    alias: [{ find: '@testing-library/svelte', replacement: '@testing-library/svelte/svelte5' }],
  },
  base: '',
  server: {
    fs: {
      strict: true,
    },
    watch: {
      // Watch the UI package dist folder for changes
      ignored: ['!**/node_modules/@podman-desktop/ui-svelte/**'],
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: '.',
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es'],
    },

    emptyOutDir: true,
    reportCompressedSize: false,
  },
});
