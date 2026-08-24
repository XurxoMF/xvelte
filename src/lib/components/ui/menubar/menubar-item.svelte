<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	export type ItemProps = MenubarPrimitive.ItemProps & {
		inset?: boolean | undefined;
		variant?: "default" | "danger" | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, inset = undefined, variant = "default", ...restProps }: ItemProps = $props();
</script>

<MenubarPrimitive.Item
	bind:ref
	data-slot="menubar-item"
	data-inset={inset}
	data-variant={variant}
	class={cn(
		"group/menubar-item flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground not-data-[variant=danger]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=danger]:text-danger data-[variant=danger]:focus:bg-danger/10 data-[variant=danger]:focus:text-danger dark:data-[variant=danger]:focus:bg-danger/20 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 data-[variant=danger]:*:[svg]:text-danger!",
		className
	)}
	{...restProps}
/>
