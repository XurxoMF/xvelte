<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	/** Props accepted by a Questionnaire item's semantic legend. */
	export type TitleProps = QuestionnairePrimitive.TitleProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: TitleProps = $props();
</script>

<QuestionnairePrimitive.Title
	bind:ref
	data-slot="questionnaire-title"
	class={cn("text-base font-semibold text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-5", className)}
	{...restProps}
/>
