<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	/** Props for an inline link from document content to one footnote definition. */
	export type ReferenceProps = WithoutChildren<WithElementRef<HTMLAnchorAttributes>> & {
		/** Destination ID of the matching footnote definition. */
		href: string;
		/** Visible footnote number and parameter for the default accessible label. */
		number: number;
		/** Optional custom marker content in place of the footnote number. */
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
		class: className,
		children,
		"aria-label": ariaLabel = m.ivory_badger_drift({ number }),
		...restProps
	}: ReferenceProps = $props();
</script>

<sup data-slot="footnote-reference" class="ms-0.5 align-super text-xs leading-none">
	<a
		bind:this={ref}
		data-slot="footnote-reference-link"
		{href}
		aria-label={ariaLabel}
		class={cn("font-medium text-primary no-underline hover:underline", className)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			{number}
		{/if}
	</a>
</sup>
