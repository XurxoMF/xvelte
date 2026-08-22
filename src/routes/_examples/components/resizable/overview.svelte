<script lang="ts">
	import * as Resizable from "$lib/components/ui/resizable";
</script>

<div class="aspect-video rounded-lg border">
	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane defaultSize={35} minSize={20}>
			<div class="flex size-full items-center justify-center p-6">Navigation</div>
		</Resizable.Pane>

		<Resizable.Handle withHandle />

		<Resizable.Pane defaultSize={65} minSize={30}>
			<Resizable.PaneGroup direction="vertical">
				<Resizable.Pane defaultSize={35} minSize={20}>
					<div class="flex size-full items-center justify-center p-6">Content Top</div>
				</Resizable.Pane>

				<Resizable.Handle withHandle />

				<Resizable.Pane defaultSize={65} minSize={30}>
					<div class="flex size-full items-center justify-center p-6">Content Bottom</div>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
