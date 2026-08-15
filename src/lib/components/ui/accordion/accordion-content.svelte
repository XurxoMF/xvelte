<script lang="ts" module>
	import { Accordion as AccordionPrimitive } from "bits-ui";

	import type { WithoutChild } from "$lib/utils";

	export type ContentProps = WithoutChild<AccordionPrimitive.ContentProps>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ContentProps = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	data-slot="accordion-content"
	class="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
	{...restProps}
>
	<div class={cn("pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4", className)}>
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
