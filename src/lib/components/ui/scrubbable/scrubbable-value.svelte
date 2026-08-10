<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";
	export type ValueProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & { format?: ((value: number) => string) | undefined };
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { getScrubbableContext } from "./scrubbable-context";

	let { ref = $bindable(null), class: className, format = (value: number) => value.toString(), ...restProps }: ValueProps = $props();

	const ctx = getScrubbableContext();
	let val = $derived(ctx.value);
</script>

<span bind:this={ref} class={cn("pointer-events-none tabular-nums transition-opacity", className)} data-slot="scrubbable-value" {...restProps}>
	{format(val)}
</span>
