<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	import type { WithoutChild } from "$lib/utils";

	export type SubTriggerProps = WithoutChild<MenubarPrimitive.SubTriggerProps> & {
		inset?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { ChevronRightIcon } from "$lib/icons";

	let { ref = $bindable(null), class: className, inset = undefined, children, ...restProps }: SubTriggerProps = $props();
</script>

<MenubarPrimitive.SubTrigger
	bind:ref
	data-slot="menubar-sub-trigger"
	data-inset={inset}
	class={cn(
		"flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronRightIcon class="ml-auto size-4" />
</MenubarPrimitive.SubTrigger>
