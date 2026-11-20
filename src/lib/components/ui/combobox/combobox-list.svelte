<script lang="ts" module>
	import type { WithoutChild } from "#lib/utils.ts";

	import * as Command from "#lib/components/ui/command/index.ts";

	/** Props for the Combobox result list. */
	export type ListProps = WithoutChild<Command.ListProps>;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, children, ...restProps }: ListProps = $props();
</script>

<Command.List bind:ref data-slot="combobox-list" class={cn("w-full scroll-my-1 p-1", className)} {...restProps}>
	{@render children?.()}
</Command.List>
