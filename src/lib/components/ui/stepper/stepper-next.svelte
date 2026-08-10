<script lang="ts" module>
	import type { WithChild } from "svelte-toolbelt";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type NextProps = WithChild<Omit<ButtonProps, "children">>;
</script>

<script lang="ts">
	import { box, mergeProps } from "svelte-toolbelt";

	import { Root as Button } from "$lib/components/ui/button";

	import { useStepperStepButton } from "./stepper.svelte.js";

	let { disabled = false, child, children, variant = "default", size = "default", ...restProps }: NextProps = $props();

	const buttonState = useStepperStepButton({
		type: box.with(() => "next"),
		disabled: box.with(() => disabled ?? false)
	});

	const mergedProps = $derived(mergeProps(buttonState.props, restProps, { variant, size, "data-slot": "stepper-next" }));
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<Button {...mergedProps}>
		{@render children?.()}
	</Button>
{/if}
