<script lang="ts" module>
	import * as Button from "$lib/components/ui/button";

	/** Props accepted by the Code Block copy action. */
	export type CopyButtonProps = Omit<Button.RootProps, "onclick"> & {
		value: string;
		onclick?: ((event: MouseEvent) => void) | undefined;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	import { CheckIcon, CopyIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		value,
		variant = "ghost",
		size = "icon-xs",
		onclick,
		"aria-label": ariaLabel,
		...restProps
	}: CopyButtonProps = $props();

	let copied = $state(false);
	let timeout: ReturnType<typeof setTimeout> | undefined;

	/** Copies the supplied value and exposes a two-second success state. */
	function copy() {
		void navigator.clipboard
			.writeText(value)
			.then(() => {
				copied = true;
				clearTimeout(timeout);
				timeout = setTimeout(() => (copied = false), 2000);
			})
			.catch(() => undefined);
	}

	onDestroy(() => clearTimeout(timeout));
</script>

<Button.Root
	bind:ref
	data-slot="code-block-copy-button"
	data-copied={copied || undefined}
	{variant}
	{size}
	aria-label={ariaLabel ?? (copied ? m.calm_heron_copied() : m.early_swan_copy())}
	class={cn(className)}
	onclick={(event) => {
		onclick?.(event);
		copy();
	}}
	{...restProps}
>
	{#if copied}
		<CheckIcon />
	{:else}
		<CopyIcon />
	{/if}
</Button.Root>

<span aria-live="polite" class="sr-only">{copied ? m.calm_heron_copied() : ""}</span>
