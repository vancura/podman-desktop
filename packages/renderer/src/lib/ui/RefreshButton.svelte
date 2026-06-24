<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

interface Props {
  label: string;
  onclick: () => void;
}
let { label, onclick }: Props = $props();
</script>

<Tooltip tip={label}>
  <button
    onclick={onclick}
    class="text-xs text-(--pd-action-button-primary-text) hover:text-(--pd-action-button-primary-hover-text)"
    aria-label={label}>
    <i class="fas fa-undo" aria-hidden="true"></i>
  </button>
</Tooltip>
