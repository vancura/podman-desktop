<script lang="ts">
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';

import Icon from '../icons/Icon.svelte';
import Tooltip from '../tooltip/Tooltip.svelte';

interface Props {
  onclick?: () => void;
  class?: string;
}

let {
  onclick = (): void => {
    dispatch('click');
  },
  class: className,
}: Props = $props();

const dispatch = createEventDispatcher<{ click: undefined }>();
</script>

<Tooltip tip="Close">
  <button
    type="button"
    class="hover:bg-[var(--pd-button-close-hover-bg)] hover:bg-opacity-10 transition-all rounded-[4px] p-1 no-underline cursor-pointer outline-transparent focus:outline-[var(--pd-button-focus-ring)] {className}"
    onclick={onclick}
    aria-label="Close">
    <Icon icon={faTimes} />
  </button>
</Tooltip>
