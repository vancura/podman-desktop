<script lang="ts">
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Button, Tooltip } from '@podman-desktop/ui-svelte';

import type { EventStoreInfo } from '/@/stores/event-store';

import TroubleshootingPageStoreDetails from './TroubleshootingPageStoreDetails.svelte';

interface Props {
  eventStoreInfo: EventStoreInfo;
}

let { eventStoreInfo }: Props = $props();

let fetchInProgress = $state(false);
async function fetch(): Promise<void> {
  fetchInProgress = true;
  try {
    await eventStoreInfo.fetch();
  } finally {
    fetchInProgress = false;
  }
}

let openDetails = $state(false);
</script>

<div class="flex flex-col bg-[var(--pd-invert-content-card-bg)] p-2 items-center rounded-sm w-full" role="listitem" aria-label={eventStoreInfo.name}>
  <div><eventStoreInfo.iconComponent size="20" /></div>
  <div class="text-xl">
    <Tooltip tip="Open Details">
      <button
        disabled={fetchInProgress}
        class="underline outline-hidden"
        aria-label="Open Details"
        onclick={(): boolean => (openDetails = true)}>
        {eventStoreInfo.name}
      </button>
    </Tooltip>
  </div>
  <div class="text-sm">({eventStoreInfo.size} items)</div>
  <div class="">
    <Button
      inProgress={fetchInProgress}
      class="my-1"
      aria-label="Refresh"
      on:click={fetch}
      icon={faRefresh}>
      Refresh
    </Button>
  </div>
  {#if eventStoreInfo.bufferEvents.length > 0}
    {@const lastUpdate = eventStoreInfo.bufferEvents[eventStoreInfo.bufferEvents.length - 1]}
    {#if lastUpdate.humanDuration}
      <Tooltip tip="Time to update">
        <div class="text-xs italic">{lastUpdate.humanDuration}</div>
      </Tooltip>
    {/if}
  {/if}

  {#if openDetails}
    <TroubleshootingPageStoreDetails
      closeCallback={(): void => {
        openDetails = false;
      }}
      eventStoreInfo={eventStoreInfo} />
  {/if}
</div>
