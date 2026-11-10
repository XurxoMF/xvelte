<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	/** Props accepted by the fixed and freeform answer list. */
	export type ChoicesProps = QuestionnairePrimitive.ChoicesProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ChoicesProps = $props();
</script>

<QuestionnairePrimitive.Choices
	bind:ref
	data-slot="questionnaire-choices"
	class={cn("group/questionnaire-choices grid min-w-0 gap-3", className)}
	{...restProps}
/>
