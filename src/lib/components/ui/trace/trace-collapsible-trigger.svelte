<script lang="ts" module>
	import type { WithoutChild } from "$lib/utils";

	import * as Collapsible from "$lib/components/ui/collapsible";

	/** Props accepted by an expandable Trace row trigger. */
	export type CollapsibleTriggerProps = WithoutChild<Collapsible.TriggerProps>;
</script>

<script lang="ts">
	import * as Trace from ".";

	import { ChevronRightIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: CollapsibleTriggerProps = $props();
</script>

<Collapsible.Trigger
	bind:ref
	data-slot="trace-collapsible-trigger"
	class={cn(
		"group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-md text-left text-muted-foreground transition-colors hover:text-foreground has-[[data-status=error]]:text-danger",
		className
	)}
	{...restProps}
>
	{@render children?.()}

	<Trace.Icon class="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90">
		<ChevronRightIcon />
	</Trace.Icon>
</Collapsible.Trigger>
