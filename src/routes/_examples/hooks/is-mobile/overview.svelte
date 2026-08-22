<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

	const mobile = new IsMobile();
</script>

{#if mobile.current}
	<Button.Root>Open mobile navigation</Button.Root>
{:else}
	<nav aria-label="Primary navigation">...</nav>
{/if}
