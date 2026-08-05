import { useEffect, useRef } from 'react';

import type { FiveMillionBannerConfig, ParticlePool } from './particle-simulation';
import {
  computeDrawRect,
  createParticlePool,
  getAtlasCellRect,
  resolveConfig,
  stepParticlePool,
} from './particle-simulation';

const ATLAS_SRC = '/img/banner/5m/atlas-placeholder.svg';
const TITLE_SRC = '/img/banner/5m/title-placeholder.svg';

// TODO: replace with the published blog post URL once it exists.
const BLOG_POST_URL = 'https://podman-desktop.io/blog';

/**
 * Canvas-based animated banner celebrating 5 million downloads: a pool of particles streams
 * left-to-right and grows as it approaches the viewer, under a static title image and a
 * full-width link to the announcement post. Falls back to a static first frame when the user
 * prefers reduced motion.
 */
function Banner(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check the refs (and the 2D context below) before binding them to their own
    // consts, rather than binding then checking. TypeScript's narrowing from an
    // early-return guard doesn't carry into the nested function declarations
    // below (resize, draw, tick, handleResize) – only the type each const has
    // at its own declaration does, so the guard must run first.
    if (!containerRef.current || !anchorRef.current || !canvasRef.current) {
      return;
    }

    const container = containerRef.current;
    const anchor = anchorRef.current;
    const canvas = canvasRef.current;

    // Get the 2D canvas context and return early if it's not available.
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
      return; // 2D context not available
    }

    const ctx = canvasContext;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Recomputed (rather than resized in place) on breakpoint changes, since particleCount
    // varies by breakpoint and the pool's arrays are fixed-size.
    function createSimulationState(width: number): { config: FiveMillionBannerConfig; pool: ParticlePool } {
      const config = resolveConfig(width);
      return { config, pool: createParticlePool(config.particleCount, config.spriteVariantCount) };
    }

    let { config, pool } = createSimulationState(container.clientWidth);

    let animationFrameId = 0;
    let resizeAnimationFrameId = 0;
    let lastTimestamp = 0;
    let atlasReady = false;

    // Load the atlas image and set up the onload handler.
    const atlas = new Image();
    atlas.onload = (): void => {
      atlasReady = true;
      draw();
    };
    atlas.src = ATLAS_SRC;

    // Resize the canvas to match the container's width and height.
    function resize(): void {
      const width = container.clientWidth;
      const height = config.redZoneHeight + config.blueZoneHeight;

      // Set the container's own height explicitly rather than letting it be
      // derived from the canvas (its only normal-flow child) – keeps the
      // box the ResizeObserver below watches from moving as a side effect
      // of this same function resizing that canvas.
      container.style.height = `${height}px`;

      // Set the anchor's height to match the red zone height.
      anchor.style.height = `${config.redZoneHeight}px`;

      // Set the canvas's size and style to match the container.
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Set the canvas's transform to scale by the device pixel ratio.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Draw the canvas.
    function draw(): void {
      const width = container.clientWidth;

      // Clear the canvas.
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Return early if the atlas is not yet ready.
      if (!atlasReady) {
        return;
      }

      // Draw each particle in the pool.
      for (let i = 0; i < pool.count; i++) {
        const t = pool.t[i];
        const rect = computeDrawRect(t, width, config);
        const cell = getAtlasCellRect(pool.spriteIndex[i], config);

        ctx.drawImage(atlas, cell.sx, cell.sy, cell.sw, cell.sh, rect.x, rect.y, rect.size, rect.size);
      }
    }

    // Update the simulation state and redraw on each animation frame.
    function tick(timestamp: number): void {
      const deltaSeconds = lastTimestamp === 0 ? 0 : (timestamp - lastTimestamp) / 1000;

      lastTimestamp = timestamp;

      stepParticlePool(pool, deltaSeconds, config.travelDurationSeconds);
      draw();

      animationFrameId = window.requestAnimationFrame(tick);
    }

    // Handle resize events by recreating the simulation state and redrawing.
    function handleResize(): void {
      ({ config, pool } = createSimulationState(container.clientWidth));

      resize();
      draw();
    }

    resize();
    draw();

    // Crossing a breakpoint changes redZoneHeight/blueZoneHeight, so handleResize
    // legitimately resizes the container that this observer watches. Doing that
    // synchronously inside the observer's own callback re-queues a notification
    // for the same element within the same delivery cycle, which the browser
    // reports as "ResizeObserver loop completed with undelivered notifications".
    // Deferring the actual work to the next animation frame breaks that loop.
    const resizeObserver = new ResizeObserver(() => {
      if (resizeAnimationFrameId) {
        // Cancel the existing animation frame if it's still running.
        window.cancelAnimationFrame(resizeAnimationFrameId);
      }

      // Request an animation frame to handle the resize.
      resizeAnimationFrameId = window.requestAnimationFrame(() => {
        resizeAnimationFrameId = 0;
        handleResize();
      });
    });

    // Observe the container for resize events.
    resizeObserver.observe(container);

    if (!prefersReducedMotion) {
      // Request an animation frame to start the simulation.
      animationFrameId = window.requestAnimationFrame(tick);
    }

    return (): void => {
      resizeObserver.disconnect();

      if (animationFrameId) {
        // Cancel the animation frame if it's still running.
        window.cancelAnimationFrame(animationFrameId);
      }

      if (resizeAnimationFrameId) {
        // Cancel the resize animation frame if it's still running.
        window.cancelAnimationFrame(resizeAnimationFrameId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-18 sm:h-21 xl:h-40">
      <a
        ref={anchorRef}
        href={BLOG_POST_URL}
        className="absolute inset-x-0 top-0 block bg-linear-to-r from-purple-300 to-purple-700 dark:from-purple-800 dark:to-purple-900">
        <span className="sr-only">Read about Podman Desktop reaching 5 million downloads</span>
      </a>
      <canvas ref={canvasRef} className="pointer-events-none relative block w-full" />

      <img
        src={TITLE_SRC}
        alt="5 million downloads"
        className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 hidden"
      />
    </div>
  );
}

export default Banner;
