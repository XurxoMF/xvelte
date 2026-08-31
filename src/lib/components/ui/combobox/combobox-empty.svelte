<script lang="ts" module>
	import type { WithoutChild } from "$lib/utils";

	import * as Command from "$lib/components/ui/command";

	/** Props for the empty filtered-results state. */
	export type EmptyProps = WithoutChild<Command.EmptyProps>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: EmptyProps = $props();
</script>

<Command.Empty bind:ref data-slot="combobox-empty" class={cn(className)} {...restProps}>{@render children?.()}</Command.Empty>
