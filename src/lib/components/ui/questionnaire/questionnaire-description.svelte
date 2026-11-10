<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	/** Props accepted by supporting text for a Questionnaire item. */
	export type DescriptionProps = QuestionnairePrimitive.DescriptionProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: DescriptionProps = $props();
</script>

<QuestionnairePrimitive.Description
	bind:ref
	data-slot="questionnaire-description"
	class={cn("text-sm text-pretty text-muted-foreground", className)}
	{...restProps}
/>
