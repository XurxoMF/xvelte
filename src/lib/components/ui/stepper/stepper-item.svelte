<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type ItemProps = WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, "id">, HTMLDivElement> & {
		id?: string;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { useStepperItem } from "./stepper.svelte.js";

	const uid = $props.id();

	let { ref = $bindable(null), id = uid, class: className, children, ...rest }: ItemProps = $props();

	const stepperItemState = useStepperItem({
		get id() {
			return id;
		}
	});
</script>

<div
	bind:this={ref}
	data-slot="stepper-item"
	class={cn(
		"group/stepper-item relative flex",
		{
			"flex-1": !stepperItemState.isLast
		},
		className
	)}
	{...stepperItemState.props}
	{...rest}
>
	{@render children?.()}
</div>
