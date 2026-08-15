<script lang="ts" module>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	export type SeparatorProps = MenubarPrimitive.SeparatorProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: SeparatorProps = $props();
</script>

<MenubarPrimitive.Separator bind:ref data-slot="menubar-separator" class={cn("-mx-1 my-1 h-px bg-border", className)} {...restProps} />
