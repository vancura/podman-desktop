<script lang="ts">
import { Dropdown } from '@podman-desktop/ui-svelte';

import { prototypeScreen } from '/@/stores/prototype-screen';

const PROTOTYPE_NAME = 'Improve state visibility in machine toolbar';

const screens: { value: string; label: string }[] = [
  { value: 'idle', label: 'Idle - no actions' },
  { value: 'single-starting', label: 'Single action - starting' },
  { value: 'single-complete', label: 'Single action - complete' },
  { value: 'dual-spinners', label: 'Dual spinners - full timeline' },
  { value: 'timer-interrupt', label: 'Timer interrupt - dismiss interrupted' },
];

let selectedScreen: string = $state(screens[0].value);

function handleChange(value: string): void {
  selectedScreen = value;
  prototypeScreen.set(value);
}
</script>

<div class="flex items-center gap-2 pr-2" style="-webkit-app-region: none;">
  <span class="text-sm font-medium text-lime-400 whitespace-nowrap select-none">
    Prototype: {PROTOTYPE_NAME}
  </span>

  <div class="prototype-dropdown">
    <Dropdown
      ariaLabel="Prototype screen selector"
      name="prototype-screen"
      class="min-w-60"
      value={selectedScreen}
      onChange={handleChange}
      options={screens} />
  </div>
</div>

<style>
  .prototype-dropdown :global(> div) {
    border: 1px solid rgb(239 68 68);
    border-radius: 4px;
  }
</style>
