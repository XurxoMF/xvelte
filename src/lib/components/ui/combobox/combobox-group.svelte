<script lang="ts" module>
	import type { WithoutChild } from "$lib/utils";

	import * as Command from "$lib/components/ui/command";

	/** Props for a grouped set of Combobox items. */
	export type GroupProps = WithoutChild<Command.GroupProps> & {
		/** Optional visible heading and fallback filtering value. */
		heading?: string | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), heading, class: className, children, ...restProps }: GroupProps = $props();
</script>

<Command.Group bind:ref data-slot="combobox-group" {heading} class={cn("scroll-my-1 p-1", className)} {...restProps}>
	{@render children?.()}
</Command.Group>
