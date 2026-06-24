<script lang="ts">
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

interface Props {
  onclick?: () => void;
}

let { onclick = (): void => {} }: Props = $props();
</script>

<Tooltip tip="Search">
  <button id="Search button" class="text-[color:var(--pd-global-nav-icon)] flex justify-center items-center gap-1" style="-webkit-app-region: none;" {onclick}>
    <Icon icon={faMagnifyingGlass} />Search
  </button>
</Tooltip>
