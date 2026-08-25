<script lang="ts" module>
	import { Select as SelectPrimitive } from "bits-ui";

	import type { WithoutChildrenOrChild } from "$lib/utils";

	export type ScrollUpButtonProps = WithoutChildrenOrChild<SelectPrimitive.ScrollUpButtonProps>;
</script>

<script lang="ts">
	import { ChevronUpIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ScrollUpButtonProps = $props();
</script>

<SelectPrimitive.ScrollUpButton
	bind:ref
	data-slot="select-scroll-up-button"
	class={cn("top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className)}
	{...restProps}
>
	<ChevronUpIcon />
</SelectPrimitive.ScrollUpButton>
