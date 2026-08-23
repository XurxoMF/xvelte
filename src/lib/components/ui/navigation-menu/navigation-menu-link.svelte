<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";

	export type LinkProps = NavigationMenuPrimitive.LinkProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: LinkProps = $props();
</script>

<NavigationMenuPrimitive.Link
	bind:ref
	data-slot="navigation-menu-link"
	class={cn(
		"flex items-center gap-2 rounded-lg p-2 text-sm transition-all hover:bg-muted focus:bg-muted in-data-[slot=navigation-menu-content]:rounded-md data-active:bg-muted/50 data-active:hover:bg-muted data-active:focus:bg-muted [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
/>
