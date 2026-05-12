<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import type { Component } from 'svelte';
import type { IconSize } from 'svelte-fa';

interface Props {
  icon: IconDefinition | Component | string;
  loading?: boolean;
  iconSize?: IconSize;
}

let { icon, loading = false, iconSize }: Props = $props();

const PIN_COUNT = 12;
const pins = Array.from({ length: PIN_COUNT }, (_, i) => ({
  angle: (360 / PIN_COUNT) * i,
  opacity: 0.3 + 0.7 * (((PIN_COUNT - i) % PIN_COUNT) / PIN_COUNT),
}));
</script>

<div class="relative flex items-center justify-center">
  <Icon size={iconSize} icon={icon} />
  {#if loading}
    <svg
      class="spinner-svg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      viewBox="0 0 40 40"
      aria-label="spinner"
      role="status">
      <g class="spinner-pins" style="transform-origin: 20px 20px;">
        {#each pins as pin (pin.angle)}
          <line
            x1="20" y1="3"
            x2="20" y2="6"
            transform="rotate({pin.angle}, 20, 20)"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
            opacity={pin.opacity} />
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  .spinner-svg {
    width: 2.25em;
    height: 2.25em;
  }

  .spinner-pins {
    animation: spinner-rotate 720ms steps(12) infinite;
  }

  @keyframes spinner-rotate {
    to {
      transform: rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner-pins {
      animation: none;
    }
  }
</style>
