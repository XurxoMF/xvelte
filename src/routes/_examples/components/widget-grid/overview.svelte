<script lang="ts">
	import * as WidgetGrid from "$lib/components/ui/widget-grid";
</script>

<WidgetGrid.Root columns={6} gap={12} class="size-full">
	<WidgetGrid.Item id="activity-1" x={0} y={0} width={2} height={2} class="p-4">
		<WidgetGrid.DragHandle class="absolute top-2 right-2" />
		<h2 class="font-medium">Recent activity 1</h2>
		<p class="text-muted-foreground">No new events 1.</p>
		<WidgetGrid.ResizeHandle />
	</WidgetGrid.Item>

	<WidgetGrid.Item id="activity-2" x={2} y={0} width={3} height={3} class="p-4">
		<WidgetGrid.DragHandle class="absolute top-2 right-2" />
		<h2 class="font-medium">Recent activity 2</h2>
		<p class="text-muted-foreground">No new events 2.</p>
		<WidgetGrid.ResizeHandle />
	</WidgetGrid.Item>
</WidgetGrid.Root>
