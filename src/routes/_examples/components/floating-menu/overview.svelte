<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as ButtonGroup from "$lib/components/ui/button-group";
	import * as FloatingMenu from "$lib/components/ui/floating-menu";

	let zoom = $state(100);
</script>

<div class="relative min-h-64 overflow-hidden rounded-lg border">
	<div class="grid min-h-64 place-items-center" aria-live="polite">
		Preview at {zoom}%
	</div>

	<FloatingMenu.Root position="bottom-right" orientation="horizontal">
		<FloatingMenu.Group role="group" aria-label="Preview zoom">
			<ButtonGroup.Root>
				<Button.Root variant="ghost" size="icon" aria-label="Zoom out" onclick={() => (zoom = Math.max(25, zoom - 25))}>−</Button.Root>

				<Button.Root variant="ghost" onclick={() => (zoom = 100)}>
					{zoom}%
				</Button.Root>

				<Button.Root variant="ghost" size="icon" aria-label="Zoom in" onclick={() => (zoom = Math.min(200, zoom + 25))}>+</Button.Root>
			</ButtonGroup.Root>
		</FloatingMenu.Group>
	</FloatingMenu.Root>
</div>
