<script lang="ts">
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { fade } from 'svelte/transition';

import type { PopoverEntry } from '/@/stores/prototype-screen';

interface Props {
  entries: PopoverEntry[];
  leftPx: number;
}

let { entries, leftPx }: Props = $props();

let allDone = $derived(entries.length > 0 && entries.every(e => e.status === 'done'));
let dismissed = $state(false);
let dismissTimer: ReturnType<typeof setTimeout> | undefined;

$effect(() => {
  if (allDone) {
    dismissed = false;
    clearTimeout(dismissTimer);
    dismissTimer = setTimeout(() => {
      dismissed = true;
    }, 3000);
  } else {
    dismissed = false;
    clearTimeout(dismissTimer);
  }

  return (): void => clearTimeout(dismissTimer);
});

let shouldShow = $derived(entries.length > 0 && !dismissed);
let shown = $state(false);
let showTimer: ReturnType<typeof setTimeout> | undefined;

$effect(() => {
  clearTimeout(showTimer);
  if (shouldShow) {
    showTimer = setTimeout(() => {
      shown = true;
    }, 500);
  } else {
    shown = false;
  }
  return (): void => clearTimeout(showTimer);
});

$effect(() => {
  window.dispatchEvent(new CustomEvent(shown ? 'tooltip-hide' : 'tooltip-show'));
  return (): void => {
    window.dispatchEvent(new CustomEvent('tooltip-show'));
  };
});
</script>

{#if shown}
  <div
    class="absolute top-full mt-px z-[100] pointer-events-none transition-[left] duration-500 ease-in-out"
    style="left: {leftPx}px; transform: translateX(-50%);"
    transition:fade={{ duration: 200 }}
    role="status"
    aria-label="Action status">
    <div
      class="rounded-[9px] border-[1px] border-[var(--pd-tooltip-outer-border)] shadow-[0_4px_12px_var(--pd-shadow-color)]">
      <div
        class="px-3 py-2 rounded-[9px] bg-[var(--pd-tooltip-bg)] text-[var(--pd-tooltip-text)] border-[1px] border-[var(--pd-tooltip-inner-border)] backdrop-blur-sm text-[12px] leading-[18px] whitespace-nowrap">
        {#each entries as entry (entry.action)}
          <div class="flex items-center gap-1.5">
            <div class="flex items-center justify-center w-[1em] h-[1em] shrink-0">
              {#if entry.status === 'in-progress'}
                <Spinner size="1em" />
              {:else}
                <Icon icon={faCheck} class="text-[var(--pd-status-running)]" />
              {/if}
            </div>
            <span>{entry.label}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

