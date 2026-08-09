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
	import { scale } from "svelte/transition";

	import { CheckIcon, CloseIcon, CopyIcon } from "$lib/icons";
	import { cn } from "$lib/utils";
	import { Root as Button } from "$lib/components/ui/button";
	import { UseClipboard } from "$lib/hooks/use-clipboard.svelte";

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
	const clipboard = new UseClipboard();

	async function copy(event: Parameters<NonNullable<CopyButtonProps["onclick"]>>[0]) {
		const status = await clipboard.copy(code.code);
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
	{#if clipboard.status === "success"}
		<span in:scale={{ duration: animationDuration }}><CheckIcon /></span>
	{:else if clipboard.status === "failure"}
		<span in:scale={{ duration: animationDuration }}><CloseIcon /></span>
	{:else}
		<span in:scale={{ duration: animationDuration }}><CopyIcon /></span>
	{/if}
</Button>
