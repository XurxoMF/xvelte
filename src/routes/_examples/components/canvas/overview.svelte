<script lang="ts">
	import * as Canvas from "$lib/components/ui/canvas";
</script>

<div class="h-96 overflow-hidden rounded-lg border">
	<Canvas.Root>
		<Canvas.Node id="welcome" x={80} y={80} class="w-56 rounded-lg border bg-popover p-4 shadow-sm">
			<h2 class="font-semibold">Welcome</h2>
			<p class="mt-1 text-sm text-muted-foreground">Drag this node or move it with the arrow keys.</p>
		</Canvas.Node>

		<Canvas.Controls />
	</Canvas.Root>
</div>
