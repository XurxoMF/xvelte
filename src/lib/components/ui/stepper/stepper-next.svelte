<script lang="ts">
	import { box, mergeProps } from "svelte-toolbelt";

	import { Root as Button } from "$lib/components/ui/button";

	import { useStepperStepButton } from "./stepper.svelte.js";
	import type { StepperNextButtonProps } from "./types";

	let { disabled = false, child, children, variant = "default", size = "default", ...rest }: StepperNextButtonProps = $props();

	const buttonState = useStepperStepButton({
		type: box.with(() => "next"),
		disabled: box.with(() => disabled ?? false)
	});

	const mergedProps = $derived(mergeProps(buttonState.props, rest, { variant, size, "data-slot": "stepper-next" }));
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<Button {...mergedProps}>
		{@render children?.()}
	</Button>
{/if}
