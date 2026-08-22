<script lang="ts">
	import type { Point } from "$lib/components/ui/point-picker";

	import * as PointPicker from "$lib/components/ui/point-picker";

	let value = $state<Point>({ x: 50, y: 50 });
</script>

<div class="grid max-w-xl gap-2">
	<PointPicker.Root bind:value label="Map position" class="h-64 rounded-lg border bg-background" showGrid showCrosshair showValue>
		<div class="grid size-full place-items-center text-sm text-muted-foreground">Map or visual content</div>
	</PointPicker.Root>

	<p class="text-sm text-muted-foreground">Selected position: {value.x}, {value.y}</p>
</div>
