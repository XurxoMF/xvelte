<script lang="ts" module>
	import { Command as CommandPrimitive } from "bits-ui";

	export type EmptyProps = CommandPrimitive.EmptyProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: EmptyProps = $props();
</script>

<CommandPrimitive.Empty bind:ref data-slot="command-empty" class={cn("py-6 text-center text-sm", className)} {...restProps} />
