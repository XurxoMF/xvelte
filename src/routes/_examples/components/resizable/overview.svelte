<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";
</script>

<Resizable.PaneGroup direction="horizontal" class="h-72 rounded-lg border">
	<Resizable.Pane defaultSize={35} minSize={20}>
		<div class="flex h-full items-center justify-center p-6">Navigation</div>
	</Resizable.Pane>

	<Resizable.Handle withHandle />

	<Resizable.Pane defaultSize={65} minSize={30}>
		<div class="flex h-full items-center justify-center p-6">Workspace</div>
	</Resizable.Pane>
</Resizable.PaneGroup>
