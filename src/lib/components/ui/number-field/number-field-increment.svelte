<script lang="ts" module>
	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type IncrementProps = Omit<ButtonProps, "disabled"> & {
		disabled?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	import { PlusIcon } from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";
	import { Root as Button } from "$lib/components/ui/button";

	import { NumberFieldButtonState } from "./number-field-context.svelte.js";

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
	}: IncrementProps = $props();

	const buttonState = new NumberFieldButtonState({
		direction: "up",
		get onpointerdown() {
			return onpointerdown;
		},
		get onpointerup() {
			return onpointerup;
		},
		get onpointerleave() {
			return onpointerleave;
		},
		get onpointercancel() {
			return onpointercancel;
		},
		get onclick() {
			return onclick;
		},
		get disabled() {
			return disabled;
		}
	});

	onDestroy(() => buttonState.destroy());
</script>

<Button
	{variant}
	{size}
	{tabindex}
	bind:ref
	data-slot="number-field-increment"
	aria-label={m.silver_yak_more()}
	class={cn("touch-manipulation", className)}
	{...buttonState.props}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<PlusIcon />
	{/if}
</Button>
