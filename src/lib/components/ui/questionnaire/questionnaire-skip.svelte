<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	import * as Button from "$lib/components/ui/button";

	/** Props accepted by the Questionnaire explicit-skip button. */
	export type SkipProps = QuestionnairePrimitive.SkipProps & {
		size?: Button.RootSizes | undefined;
		variant?: Button.RootVariants | undefined;
	};
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, size = "default", variant = "outline", children, ...restProps }: SkipProps = $props();
</script>

<QuestionnairePrimitive.Skip
	bind:ref
	data-slot="questionnaire-skip"
	data-size={size}
	data-variant={variant}
	class={cn(Button.rootVariants({ size, variant }), "col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0", className)}
	{...restProps}
>
	{#if children}{@render children()}{:else}{m.zesty_heron_skip()}{/if}
</QuestionnairePrimitive.Skip>
