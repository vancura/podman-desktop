<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

import { ContainerUtils } from './container-utils';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;

const containerUtils = new ContainerUtils();
</script>

{#if containerUtils.isContainerInfoUI(object)}
  <Tooltip tip={object.image}>
    <div class="text-[var(--pd-table-body-text)] overflow-hidden text-ellipsis">
      {object.shortImage}
    </div>
  </Tooltip>
{/if}
