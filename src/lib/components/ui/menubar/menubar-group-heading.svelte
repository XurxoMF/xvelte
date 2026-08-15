<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	export type GroupHeadingProps = MenubarPrimitive.GroupHeadingProps & {
		inset?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), inset, class: className, ...restProps }: GroupHeadingProps = $props();
</script>

<MenubarPrimitive.GroupHeading
	bind:ref
	data-slot="menubar-group-heading"
	data-inset={inset}
	class={cn("px-2 py-1.5 text-sm font-medium data-inset:ps-8", className)}
	{...restProps}
/>
