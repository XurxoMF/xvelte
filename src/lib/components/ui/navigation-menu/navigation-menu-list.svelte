<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";

	export type ListProps = NavigationMenuPrimitive.ListProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ListProps = $props();
</script>

<NavigationMenuPrimitive.List
	bind:ref
	data-slot="navigation-menu-list"
	class={cn("group flex flex-1 list-none items-center justify-center gap-0", className)}
	{...restProps}
/>
