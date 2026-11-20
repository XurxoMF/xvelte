<script lang="ts" module>
	import * as Collapsible from "#lib/components/ui/collapsible/index.ts";

	/** Props accepted by an expandable Trace group. */
	export type CollapsibleProps = Collapsible.RootProps;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), open = $bindable(false), class: className, ...restProps }: CollapsibleProps = $props();
</script>

<Collapsible.Root bind:ref bind:open data-slot="trace-collapsible" class={cn("flex w-full min-w-0 flex-col", className)} {...restProps} />
