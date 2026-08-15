<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type RootApi = CommandPrimitive.Root;

	export type RootProps = CommandPrimitive.RootProps & {
		api?: RootApi | null | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { api = $bindable(null), ref = $bindable(null), value = $bindable(""), class: className, ...restProps }: RootProps = $props();
</script>

<CommandPrimitive.Root
	bind:this={api}
	bind:value
	bind:ref
	data-slot="command"
	class={cn("flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground", className)}
	{...restProps}
/>
