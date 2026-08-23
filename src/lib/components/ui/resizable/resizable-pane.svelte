<script lang="ts" module>
	import * as ResizablePrimitive from "paneforge";

	export type PaneProps = ResizablePrimitive.PaneProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: PaneProps = $props();
</script>

<ResizablePrimitive.Pane bind:ref data-slot="resizable-pane" class={cn("flex-1 overflow-hidden", className)} {...restProps} />
