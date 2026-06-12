<script lang="ts">
import type { ColorInfo } from '@podman-desktop/core-api';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { colorsInfos, darkContextColorsInfos, hcDarkContextColorsInfos } from '/@/stores/colors';

let style: HTMLStyleElement;

let unsubscribeCurrent: Unsubscriber;
let unsubscribeDark: Unsubscriber;
let unsubscribeHcDark: Unsubscriber;

let currentInfos: ColorInfo[] = [];
let darkInfos: ColorInfo[] = [];
let hcDarkInfos: ColorInfo[] = [];

function createStyleSheet(): HTMLStyleElement {
  style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'podman-desktop-colors-styles';
  style.media = 'screen';

  document.head.append(style);

  style.textContent = '';

  return style;
}

function toVars(infos: ColorInfo[]): string {
  return infos.map(color => `${color.cssVar}: ${color.value};`).join('\n    ');
}

function regenerateCSS(): void {
  style.textContent = `
  :root {
    ${toVars(currentInfos)}
  }
  [data-pd-force-theme="dark"] {
    ${toVars(darkInfos)}
  }
  [data-pd-force-theme="hc-dark"] {
    ${toVars(hcDarkInfos)}
  }
`;
}

onMount(() => {
  createStyleSheet();

  unsubscribeCurrent = colorsInfos.subscribe(infos => {
    currentInfos = infos;
    regenerateCSS();
  });

  unsubscribeDark = darkContextColorsInfos.subscribe(infos => {
    darkInfos = infos;
    regenerateCSS();
  });

  unsubscribeHcDark = hcDarkContextColorsInfos.subscribe(infos => {
    hcDarkInfos = infos;
    regenerateCSS();
  });
});

onDestroy(() => {
  style?.remove();
  unsubscribeCurrent?.();
  unsubscribeDark?.();
  unsubscribeHcDark?.();
});
</script>
