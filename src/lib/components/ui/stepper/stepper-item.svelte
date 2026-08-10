<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type ItemProps = WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, "id">, HTMLDivElement> & {
		id?: string | undefined;
	};
</script>

<script lang="ts">
	import { untrack } from "svelte";

	import { cn } from "$lib/utils";

	import { setStepperItemContext } from "./stepper-context.svelte.js";

	const uid = $props.id();

	let { ref = $bindable(null), id = uid, class: className, children, ...restProps }: ItemProps = $props();

	const item = setStepperItemContext(untrack(() => id));
</script>

<div
	bind:this={ref}
	data-slot="stepper-item"
	class={cn(
		"group/stepper-item relative flex",
		{
			"flex-1": !item.isLast
		},
		className
	)}
	id={item.id}
	data-step={item.id}
	data-state={item.state}
	{...restProps}
>
	{@render children?.()}
</div>
