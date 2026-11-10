<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props accepted by the Questionnaire navigation layout. */
	export type ActionsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ActionsProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="questionnaire-actions"
	class={cn("grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-9", className)}
	{...restProps}
>
	{@render children?.()}
</div>
