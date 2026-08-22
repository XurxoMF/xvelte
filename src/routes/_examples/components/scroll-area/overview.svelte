<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";

	const releases = Array.from({ length: 30 }, (_, index) => `Version 2.${29 - index}`);
</script>

<ScrollArea.Root class="h-72 w-64 rounded-lg border">
	<div class="space-y-2 p-4">
		<h2 class="font-medium">Releases</h2>
		{#each releases as release (release)}
			<p class="text-sm">{release}</p>
		{/each}
	</div>
</ScrollArea.Root>
