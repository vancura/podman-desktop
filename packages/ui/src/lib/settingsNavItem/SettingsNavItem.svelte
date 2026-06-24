<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import type { Component } from 'svelte';

import ChevronExpander from '../icons/ChevronExpander.svelte';
import Icon from '../icons/Icon.svelte';
import Tooltip from '../tooltip/Tooltip.svelte';

interface Props {
  title: string;
  href: string;
  section?: boolean;
  expanded?: boolean;
  child?: boolean;
  selected?: boolean;
  icon?: IconDefinition | Component | string;
  iconRight?: IconDefinition | Component | string;
  iconRightAlign?: 'inline' | 'end';
  onClick?: () => void;
}

let {
  title,
  href,
  section = false,
  expanded = $bindable(),
  child = false,
  selected = false,
  icon = undefined,
  iconRight = undefined,
  iconRightAlign = 'end',
  onClick = (): void => {},
}: Props = $props();

let labelEl: HTMLElement | undefined = $state(undefined);
let isTruncated = $state(false);

$effect(() => {
  if (labelEl) {
    isTruncated = labelEl.scrollWidth > labelEl.clientWidth;
  }
});

function click(): void {
  expanded = !expanded;
  onClick();
}
</script>

<Tooltip tip={isTruncated ? title : undefined} right containerClass="block w-full">
  <a class="no-underline" href={href} aria-label={title} onclick={click}>
    <div
      class="flex w-full pr-1 py-2 justify-between items-center cursor-pointer border-l-[4px]"
      class:pl-3={!child}
      class:pl-[34px]={child}
      class:leading-none={child}
      class:text-md={!child}
      class:font-medium={!child}
      class:bg-[var(--pd-secondary-nav-selected-bg)]={selected}
      class:border-[var(--pd-secondary-nav-bg)]={!selected}
      class:border-[var(--pd-secondary-nav-selected-highlight)]={selected}
      class:text-[color:var(--pd-secondary-nav-text-selected)]={selected}
      class:text-[color:var(--pd-secondary-nav-text)]={!selected}
      class:hover:text-[color:var(--pd-secondary-nav-text-hover)]={!selected}
      class:hover:bg-[var(--pd-secondary-nav-text-hover-bg)]={!selected}
      class:hover:border-[var(--pd-secondary-nav-text-hover-bg)]={!selected}>
      <span
        class="group-hover:block flex flex-row gap-x-2 items-center min-w-0"
        class:capitalize={!child}>
        {#if icon}
          <Icon icon={icon}/>
        {/if}
        <span bind:this={labelEl} class="truncate">{title}</span>
        {#if iconRight && iconRightAlign === 'inline'}
          <Icon icon={iconRight}/>
        {/if}
      </span>
      {#if section}
        <div class="px-2 text-[color:var(--pd-secondary-nav-expander)] pointer-events-none">
          <ChevronExpander expanded={expanded} />
        </div>
      {:else if iconRight && iconRightAlign === 'end'}
        <div class="px-2 flex items-center">
          <Icon icon={iconRight}/>
        </div>
      {/if}
    </div>
  </a>
</Tooltip>
