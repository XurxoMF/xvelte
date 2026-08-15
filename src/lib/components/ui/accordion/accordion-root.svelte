<script lang="ts" module>
	import { Accordion as AccordionPrimitive } from "bits-ui";

	export type RootProps = AccordionPrimitive.RootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), value = $bindable(), class: className, ...restProps }: RootProps = $props();
</script>

<AccordionPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="accordion"
	class={cn("cn-accordion flex w-full flex-col", className)}
	{...restProps}
/>
