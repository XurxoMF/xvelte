<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";

	export type TriggerProps = NavigationMenuPrimitive.TriggerProps;
</script>

<script lang="ts">
	import { ChevronDownIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: TriggerProps = $props();
</script>

<NavigationMenuPrimitive.Trigger
	bind:ref
	data-slot="navigation-menu-trigger"
	class={cn(
		"group group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all hover:bg-muted focus:bg-muted disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronDownIcon
		class="relative top-px ml-1 size-3 transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180"
		aria-hidden="true"
	/>
</NavigationMenuPrimitive.Trigger>
