<script lang="ts" module>
	import type { Snippet } from "svelte";

	import * as Button from "$lib/components/ui/button";

	export type NextProps = Omit<Button.RootProps, "children"> & {
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { getStepperContext } from "./stepper-context.svelte.js";

	let { disabled = false, onclick, child, children, variant = "default", size = "default", ...restProps }: NextProps = $props();

	const stepper = getStepperContext();

	/** Advances the stepper before forwarding the click event. */
	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		stepper.next();
		onclick?.(event);
	}

	const buttonProps = $derived({
		...restProps,
		variant,
		size,
		disabled: Boolean(disabled) || !stepper.canIncrement,
		onclick: handleClick,
		"data-slot": "stepper-next"
	});
</script>

{#if child}
	{@render child({ props: buttonProps })}
{:else}
	<Button.Root {...buttonProps}>
		{@render children?.()}
	</Button.Root>
{/if}
