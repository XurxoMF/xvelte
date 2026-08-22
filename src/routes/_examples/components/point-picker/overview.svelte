<script lang="ts">
	import type { Point } from "$lib/components/ui/point-picker";

	import * as Field from "$lib/components/ui/field";
	import * as PointPicker from "$lib/components/ui/point-picker";

	let value = $state<Point>({ x: 80, y: 45 });
</script>

<Field.Field>
	<Field.Title>Map position</Field.Title>

	<PointPicker.Root
		bind:value
		label="Map position"
		maxX={160}
		maxY={90}
		class="w-full rounded-lg border bg-background"
		aria-describedby="map-position-description"
		showGrid
		showCrosshair
		showValue
	>
		<div class="grid size-full place-items-center text-sm text-muted-foreground">Map or visual content</div>
	</PointPicker.Root>

	<Field.Description id="map-position-description">Selected position: {value.x}, {value.y}.</Field.Description>
</Field.Field>
