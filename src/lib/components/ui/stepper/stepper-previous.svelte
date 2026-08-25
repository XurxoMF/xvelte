<script lang="ts" module>
	import type { Snippet } from "svelte";

	import * as Button from "$lib/components/ui/button";

	export type PreviousProps = Omit<Button.RootProps, "children"> & {
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { getStepperContext } from "./stepper-context.svelte.js";

	let { disabled = false, onclick, child, children, variant = "outline", size = "default", ...restProps }: PreviousProps = $props();

	const stepper = getStepperContext();

	/** Moves back one step before forwarding the click event. */
	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		stepper.previous();
		onclick?.(event);
	}

	const buttonProps = $derived({
		...restProps,
		variant,
		size,
		disabled: Boolean(disabled) || !stepper.canDecrement,
		onclick: handleClick,
		"data-slot": "stepper-previous"
	});
</script>

{#if child}
	{@render child({ props: buttonProps })}
{:else}
	<Button.Root {...buttonProps}>
		{@render children?.()}
	</Button.Root>
{/if}
