<script lang="ts" module>
	import type { Snippet } from "svelte";

	import type { WithoutChildrenOrChild } from "$lib/utils";

	import * as Popover from "$lib/components/ui/popover";
	import * as Command from "$lib/components/ui/command";

	/** Props for the positioned Combobox content and its internal Command root. */
	export type ContentProps = WithoutChildrenOrChild<Popover.ContentProps> & {
		/** Classes merged after the local positioned-content styles. */
		class?: string | undefined;
		/** Configuration forwarded to the internal Command root. */
		commandProps?: WithoutChildrenOrChild<Command.RootProps> | undefined;
		/** Search input and result-list content. */
		children: Snippet;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, commandProps, children, ...restProps }: ContentProps = $props();
</script>

<Popover.Content
	bind:ref
	data-slot="combobox-content"
	class={cn(
		"relative isolate z-50 w-(--bits-popover-anchor-width) min-w-36 scroll-my-1 overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-0 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
		className
	)}
	{...restProps}
>
	<Command.Root {...commandProps} class={cn("w-full p-0", commandProps?.class)}>
		{@render children()}
	</Command.Root>
</Popover.Content>
