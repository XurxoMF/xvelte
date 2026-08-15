<script lang="ts" module>
	import type { Separator as SeparatorPrimitive } from "bits-ui";

	export type SeparatorProps = SeparatorPrimitive.RootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import * as Separator from "$lib/components/ui/separator";

	let { ref = $bindable(null), class: className, ...restProps }: SeparatorProps = $props();
</script>

<Separator.Root bind:ref data-slot="select-separator" class={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)} {...restProps} />
