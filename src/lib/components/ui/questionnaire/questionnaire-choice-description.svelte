<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props accepted by supporting text inside a Questionnaire choice. */
	export type ChoiceDescriptionProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ChoiceDescriptionProps = $props();
</script>

<span bind:this={ref} data-slot="questionnaire-choice-description" class={cn("text-muted-foreground", className)} {...restProps}>
	{@render children?.()}
</span>
