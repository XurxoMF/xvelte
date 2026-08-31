<script lang="ts">
	import { fade } from "svelte/transition";

	let {
		top = 0,
		left = 0,
		width = 0,
		height = 0,
		open = false,
		showOverlay = true
	}: {
		top: number;
		left: number;
		width: number;
		height: number;
		open: boolean;
		showOverlay?: boolean | undefined;
	} = $props();
</script>

{#if open}
	<div data-slot="walkthrough-overlay" aria-hidden="true" transition:fade={{ duration: 300 }} class="fixed inset-0 z-9998">
		{#if showOverlay}
			<div
				data-slot="walkthrough-spotlight"
				class="pointer-events-none fixed transition-all duration-500 ease-in-out"
				style="
            top: {top}px;
            left: {left}px;
            width: {width}px;
            height: {height}px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
            border-radius: 6px;
        "
			></div>
		{/if}
	</div>
{/if}
