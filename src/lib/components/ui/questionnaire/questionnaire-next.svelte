<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	import * as Button from "$lib/components/ui/button";

	/** Props accepted by the Questionnaire next-step button. */
	export type NextProps = QuestionnairePrimitive.NextProps & {
		size?: Button.RootSizes | undefined;
		variant?: Button.RootVariants | undefined;
	};
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, size = "default", variant = "default", children, ...restProps }: NextProps = $props();
</script>

<QuestionnairePrimitive.Next
	bind:ref
	data-slot="questionnaire-next"
	data-size={size}
	data-variant={variant}
	class={cn(Button.rootVariants({ size, variant }), "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0", className)}
	{...restProps}
>
	{#if children}{@render children()}{:else}{m.agile_pine_next()}{/if}
</QuestionnairePrimitive.Next>
