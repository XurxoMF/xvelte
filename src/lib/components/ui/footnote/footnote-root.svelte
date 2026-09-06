<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for the labelled section that contains a document's footnote definitions. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLElement>, HTMLElement>;
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, "aria-label": ariaLabel = m.hollow_cedar_dance(), ...restProps }: RootProps = $props();
</script>

<section bind:this={ref} data-slot="footnote" aria-label={ariaLabel} class={cn("border-t border-border pt-4 text-sm", className)} {...restProps}>
	{@render children?.()}
</section>
