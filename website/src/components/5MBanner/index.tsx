import React, { useEffect, useRef } from 'react';

import type { FiveMillionBannerConfig } from './particle-simulation';
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

function Banner(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check the refs (and the 2D context below) before binding them to their own
    // consts, rather than binding then checking. TypeScript's narrowing from an
    // early-return guard doesn't carry into the nested function declarations
    // below (resize, draw, tick, handleResize) -- only the type each const has
    // at its own declaration does, so the guard must run first.
    if (!containerRef.current || !anchorRef.current || !canvasRef.current) {
      return;
    }
    const container = containerRef.current;
    const anchor = anchorRef.current;
    const canvas = canvasRef.current;

    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
      return;
    }
    const ctx = canvasContext;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let config: FiveMillionBannerConfig = resolveConfig(container.clientWidth);
    let pool = createParticlePool(config.particleCount, config.spriteVariantCount);
    let animationFrameId = 0;
    let resizeAnimationFrameId = 0;
    let lastTimestamp = 0;
    let atlasReady = false;

    const atlas = new Image();
    atlas.onload = (): void => {
      atlasReady = true;
      draw();
    };
    atlas.src = ATLAS_SRC;

    function resize(): void {
      const width = container.clientWidth;
      const height = config.redZoneHeight + config.blueZoneHeight;
      // Set the container's own height explicitly rather than letting it be
      // derived from the canvas (its only normal-flow child) -- keeps the
      // box the ResizeObserver below watches from moving as a side effect
      // of this same function resizing that canvas.
      container.style.height = `${height}px`;
      anchor.style.height = `${config.redZoneHeight}px`;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(): void {
      const width = container.clientWidth;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!atlasReady) {
        return;
      }
      for (let i = 0; i < pool.count; i++) {
        const t = pool.t[i];
        const rect = computeDrawRect(t, width, config);
        const cell = getAtlasCellRect(pool.spriteIndex[i], config);
        ctx.drawImage(atlas, cell.sx, cell.sy, cell.sw, cell.sh, rect.x, rect.y, rect.size, rect.size);
      }
    }

    function tick(timestamp: number): void {
      const deltaSeconds = lastTimestamp === 0 ? 0 : (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      stepParticlePool(pool, deltaSeconds, config.travelDurationSeconds);
      draw();
      animationFrameId = window.requestAnimationFrame(tick);
    }

    function handleResize(): void {
      config = resolveConfig(container.clientWidth);
      pool = createParticlePool(config.particleCount, config.spriteVariantCount);
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
        window.cancelAnimationFrame(resizeAnimationFrameId);
      }
      resizeAnimationFrameId = window.requestAnimationFrame(() => {
        resizeAnimationFrameId = 0;
        handleResize();
      });
    });
    resizeObserver.observe(container);

    if (!prefersReducedMotion) {
      animationFrameId = window.requestAnimationFrame(tick);
    }

    return (): void => {
      resizeObserver.disconnect();
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (resizeAnimationFrameId) {
        window.cancelAnimationFrame(resizeAnimationFrameId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <a
        ref={anchorRef}
        href={BLOG_POST_URL}
        aria-label="Read about Podman Desktop reaching 5 million downloads"
        className="absolute inset-x-0 top-0 block bg-gradient-to-r from-purple-300 to-purple-700 dark:from-purple-800 dark:to-purple-950"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none relative block w-full" />
      <img
        src={TITLE_SRC}
        alt="5 million downloads"
        className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2"
      />
    </div>
  );
}

export default Banner;
