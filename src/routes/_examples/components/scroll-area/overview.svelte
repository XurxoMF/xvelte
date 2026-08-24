<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";
	import * as Typography from "$lib/components/ui/typography";

	const releases = Array.from({ length: 30 }, (_, index) => `Version 2.${29 - index}`);
</script>

<ScrollArea.Root class="h-72 w-full rounded-lg border">
	<ScrollArea.Viewport>
		<div class="space-y-2 p-4">
			<Typography.H2>Releases</Typography.H2>
			{#each releases as release (release)}
				<Typography.P>{release}</Typography.P>
			{/each}
		</div>
	</ScrollArea.Viewport>
	<ScrollArea.ScrollbarVertical />
</ScrollArea.Root>
