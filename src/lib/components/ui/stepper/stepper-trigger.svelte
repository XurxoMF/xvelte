<script lang="ts" module>
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type TriggerProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement>;
</script>

<script lang="ts">
	import { getStepperContext, getStepperItemContext } from "./stepper-context.svelte.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), disabled = false, onclick, onkeydown, class: className, children, ...restProps }: TriggerProps = $props();

	const stepper = getStepperContext();
	const item = getStepperItemContext();

	$effect(() => {
		item.trigger = ref;

		return () => {
			if (item.trigger === ref) item.trigger = null;
		};
	});

	/** Selects this item before forwarding the click event. */
	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		stepper.select(item);
		onclick?.(event);
	}

	/** Handles orientation-aware arrow navigation before forwarding the event. */
	function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (disabled) return;

		switch (event.key) {
			case "ArrowRight":
				if (stepper.orientation === "horizontal") stepper.navigate(1);
				break;
			case "ArrowLeft":
				if (stepper.orientation === "horizontal") stepper.navigate(-1);
				break;
			case "ArrowDown":
				if (stepper.orientation === "vertical") {
					event.preventDefault();
					stepper.navigate(1);
				}
				break;
			case "ArrowUp":
				if (stepper.orientation === "vertical") {
					event.preventDefault();
					stepper.navigate(-1);
				}
				break;
		}

		onkeydown?.(event);
	}
</script>

<button
	bind:this={ref}
	data-slot="stepper-trigger"
	id={`${item.id}-trigger`}
	{disabled}
	onclick={handleClick}
	onkeydown={handleKeydown}
	data-state={item.state}
	aria-current={item.state === "active" ? "step" : undefined}
	class={cn(
		"group/stepper-trigger z-1 flex outline-none",
		"group-data-[orientation=horizontal]/stepper-nav:flex-col",
		"group-data-[orientation=vertical]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:gap-4",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</button>
