<script lang="ts" module>
	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type DecrementProps = Omit<ButtonProps, "disabled"> & {
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	import { box } from "svelte-toolbelt";

	import { cn } from "$lib/utils";
	import { MinusIcon } from "$lib/icons";
	import { Root as Button } from "$lib/components/ui/button";

	import { useNumberFieldButton } from "./number-field.svelte.js";

	let {
		ref = $bindable(null),
		variant = "ghost",
		size = "icon",
		class: className,
		children,
		disabled = false,
		onpointerdown,
		onpointerup,
		onpointerleave,
		onpointercancel,
		onclick,
		tabindex = -1,
		...restProps
	}: DecrementProps = $props();

	const buttonState = useNumberFieldButton({
		direction: "down",
		onpointerdown: box.with(() => onpointerdown),
		onpointerup: box.with(() => onpointerup),
		onpointerleave: box.with(() => onpointerleave),
		onpointercancel: box.with(() => onpointercancel),
		onclick: box.with(() => onclick),
		disabled: box.with(() => disabled)
	});

	onDestroy(() => buttonState.destroy());
</script>

<Button
	{variant}
	{size}
	{tabindex}
	bind:ref
	data-slot="number-field-decrement"
	aria-label="Decrease"
	class={cn("touch-manipulation", className)}
	{...buttonState.props}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<MinusIcon />
	{/if}
</Button>
