<script lang="ts" module>
	import { Accordion as AccordionPrimitive } from "bits-ui";

	export type ItemProps = AccordionPrimitive.ItemProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ItemProps = $props();
</script>

<AccordionPrimitive.Item bind:ref data-slot="accordion-item" class={cn("not-last:border-b", className)} {...restProps} />
