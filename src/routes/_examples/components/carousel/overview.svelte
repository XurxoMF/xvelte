<script lang="ts">
	import * as Carousel from "$lib/components/ui/carousel";
</script>

<Carousel.Root aria-label="Featured projects" class="mx-auto w-full max-w-sm">
	<Carousel.Content>
		{#each ["Atlas", "Beacon", "Compass"] as project, index (project)}
			<Carousel.Item aria-label={`${index + 1} of 3`}>
				<div class="flex aspect-video items-center justify-center rounded-lg border border-border bg-card text-foreground">
					{project}
				</div>
			</Carousel.Item>
		{/each}
	</Carousel.Content>

	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root>
