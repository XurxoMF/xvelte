<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	/** Props for a link from one footnote definition back to a reference in document content. */
	export type BackReferenceProps = WithoutChildren<WithElementRef<HTMLAnchorAttributes>> & {
		/** Destination ID of the matching inline footnote reference. */
		href: string;
		/** Footnote number used by the default accessible label. */
		number: number;
		/** One-based occurrence when the same footnote is referenced more than once. */
		occurrence?: number | undefined;
		/** Optional custom marker content in place of the return arrow. */
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		href,
		number,
		occurrence = 1,
		class: className,
		children,
		"aria-label": ariaLabel = occurrence > 1 ? m.lucid_willow_rest({ number, occurrence }) : m.kind_marten_glow({ number }),
		...restProps
	}: BackReferenceProps = $props();
</script>

<a
	bind:this={ref}
	data-slot="footnote-back-reference"
	{href}
	aria-label={ariaLabel}
	class={cn("ms-1 inline-flex items-baseline font-medium text-primary no-underline hover:underline", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">↩</span>
		{#if occurrence > 1}<sup aria-hidden="true" class="text-[0.625em]">{occurrence}</sup>{/if}
	{/if}
</a>
