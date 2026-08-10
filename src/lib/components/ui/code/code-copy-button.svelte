<script lang="ts" module>
	import type { HTMLButtonAttributes } from "svelte/elements";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";
	import type { WithElementRef } from "$lib/utils";

	export type CopyButtonProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> &
		Pick<ButtonProps, "size" | "variant"> & {
			animationDuration?: number;
			onCopy?: (status: "success" | "failure") => void;
		};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";
	import { scale } from "svelte/transition";

	import { CheckIcon, CloseIcon, CopyIcon } from "$lib/icons";
	import { cn } from "$lib/utils";
	import { Root as Button } from "$lib/components/ui/button";

	import { useCodeCopyButton } from "./code.svelte.js";

	let {
		ref = $bindable(null),
		variant = "ghost",
		size = "icon",
		animationDuration = 150,
		onCopy,
		onclick,
		class: className,
		...restProps
	}: CopyButtonProps = $props();

	const code = useCodeCopyButton();
	let status = $state<"success" | "failure">();
	let resetTimeout: ReturnType<typeof setTimeout> | undefined;

	onDestroy(() => clearTimeout(resetTimeout));

	/** @param event - Click event forwarded after the clipboard operation finishes. */
	async function copy(event: Parameters<NonNullable<CopyButtonProps["onclick"]>>[0]) {
		clearTimeout(resetTimeout);
		try {
			await navigator.clipboard.writeText(code.code);
			status = "success";
		} catch {
			status = "failure";
		}
		resetTimeout = setTimeout(() => (status = undefined), 500);
		onCopy?.(status);
		onclick?.(event);
	}
</script>

<Button
	bind:ref
	data-slot="code-copy-button"
	class={cn("absolute top-2 right-2", className)}
	tabindex={-1}
	aria-label="Copy code"
	{variant}
	{size}
	onclick={copy}
	{...restProps}
>
	{#if status === "success"}
		<span in:scale={{ duration: animationDuration }}><CheckIcon /></span>
	{:else if status === "failure"}
		<span in:scale={{ duration: animationDuration }}><CloseIcon /></span>
	{:else}
		<span in:scale={{ duration: animationDuration }}><CopyIcon /></span>
	{/if}
</Button>
