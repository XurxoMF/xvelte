<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type GroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...rest }: GroupProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="number-field-group"
	class={cn(
		"flex h-9 items-center overflow-hidden rounded-md border border-border",
		"*:data-[slot=number-field-increment]:rounded-end *:data-[slot=number-field-increment]:rounded-none *:data-[slot=number-field-increment]:focus-visible:ring-0",
		"*:data-[slot=number-field-decrement]:rounded-start *:data-[slot=number-field-decrement]:rounded-none *:data-[slot=number-field-decrement]:focus-visible:ring-0",
		"*:data-[slot=number-field-input]:rounded-none *:data-[slot=number-field-input]:border-x *:data-[slot=number-field-input]:border-y-0 *:data-[slot=number-field-input]:first:border-s-0 *:data-[slot=number-field-input]:last:border-e-0",
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
