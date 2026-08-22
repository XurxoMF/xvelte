<script lang="ts">
	import * as CompareSlider from "$lib/components/ui/compare-slider";
</script>

<CompareSlider.Root class="aspect-video w-full max-w-2xl rounded-lg">
	<CompareSlider.Item target="first">
		<div role="img" aria-label="Muted abstract scene" class="size-full bg-gradient-to-br from-muted to-muted-foreground"></div>
	</CompareSlider.Item>

	<CompareSlider.Item target="second">
		<div role="img" aria-label="Primary abstract scene" class="size-full bg-gradient-to-br from-primary/30 to-primary"></div>
	</CompareSlider.Item>

	<CompareSlider.Handle />
</CompareSlider.Root>
