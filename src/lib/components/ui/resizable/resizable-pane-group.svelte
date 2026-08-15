<script lang="ts" module>
	import * as ResizablePrimitive from "paneforge";

	export type PaneGroupProps = ResizablePrimitive.PaneGroupProps & {
		this?: ResizablePrimitive.PaneGroup | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), this: paneGroup = $bindable(), class: className, ...restProps }: PaneGroupProps = $props();
</script>

<ResizablePrimitive.PaneGroup
	bind:ref
	bind:this={paneGroup}
	data-slot="resizable-pane-group"
	class={cn("cn-resizable-panel-group flex h-full w-full data-[direction=vertical]:flex-col", className)}
	{...restProps}
/>
