<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	import * as Button from "$lib/components/ui/button";

	/** Props accepted by the Questionnaire previous-step button. */
	export type PreviousProps = QuestionnairePrimitive.PreviousProps & {
		size?: Button.RootSizes | undefined;
		variant?: Button.RootVariants | undefined;
	};
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, size = "default", variant = "outline", children, ...restProps }: PreviousProps = $props();
</script>

<QuestionnairePrimitive.Previous
	bind:ref
	data-slot="questionnaire-previous"
	data-size={size}
	data-variant={variant}
	class={cn(Button.rootVariants({ size, variant }), "col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0", className)}
	{...restProps}
>
	{#if children}{@render children()}{:else}{m.young_willow_previous()}{/if}
</QuestionnairePrimitive.Previous>
