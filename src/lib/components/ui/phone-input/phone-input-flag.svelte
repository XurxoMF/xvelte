<script lang="ts" module>
	import type { Country } from "svelte-tel-input/types";

	export type FlagProps = {
		country?: Country | null;
	};
</script>

<script lang="ts">
	import { getFlag } from "./phone-input-flags";

	let { country = null }: FlagProps = $props();
</script>

<span data-slot="phone-input-flag" class="flex h-4 w-6 shrink-0 overflow-clip rounded-sm bg-foreground/20 [&>svg]:h-4! [&>svg]:w-6!">
	{#await getFlag(country) then flag}
		{#if flag}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html flag}
		{/if}
	{/await}
</span>
