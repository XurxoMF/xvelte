<script lang="ts">
	import { shortcut } from "#lib/attachments/shortcut.ts";

	let searchOpen = $state(false);
</script>

<svelte:window
	{@attach shortcut({
		key: "k",
		meta: true,
		action: () => {
			searchOpen = true;
		}
	})}
/>

{#if searchOpen}
	<div role="dialog" aria-label="Search">...</div>
{/if}
