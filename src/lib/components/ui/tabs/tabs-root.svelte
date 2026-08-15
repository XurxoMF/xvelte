<script lang="ts" module>
	import { Tabs as TabsPrimitive } from "bits-ui";

	export type RootProps = TabsPrimitive.RootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), value = $bindable(""), class: className, ...restProps }: RootProps = $props();
</script>

<TabsPrimitive.Root
	bind:ref
	bind:value
	data-slot="tabs"
	class={cn("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", className)}
	{...restProps}
/>
