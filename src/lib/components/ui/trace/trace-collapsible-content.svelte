<script lang="ts" module>
	import type { WithoutChild } from "$lib/utils";

	import * as Collapsible from "$lib/components/ui/collapsible";

	/** Props accepted by the expandable Trace detail panel. */
	export type CollapsibleContentProps = WithoutChild<Collapsible.ContentProps>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: CollapsibleContentProps = $props();
</script>

<Collapsible.Content
	bind:ref
	data-slot="trace-collapsible-content"
	class="min-w-0 overflow-hidden animation-duration-200 [--bits-accordion-content-height:var(--bits-collapsible-content-height)] data-open:animate-accordion-down data-closed:animate-accordion-up"
	{...restProps}
>
	<div
		data-slot="trace-collapsible-content-inner"
		class={cn("ms-[calc(--spacing(2)-1px)] mt-2 mb-1 min-w-0 border-s ps-4 pe-1 leading-relaxed wrap-break-word text-muted-foreground", className)}
	>
		{@render children?.()}
	</div>
</Collapsible.Content>
