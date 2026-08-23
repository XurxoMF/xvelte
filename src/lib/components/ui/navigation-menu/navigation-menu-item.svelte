<script lang="ts" module>
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";

	export type ItemProps = NavigationMenuPrimitive.ItemProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ItemProps = $props();
</script>

<NavigationMenuPrimitive.Item bind:ref data-slot="navigation-menu-item" class={cn("relative", className)} {...restProps} />
