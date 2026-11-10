<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	/** Props accepted by one Questionnaire fieldset and navigation step. */
	export type ItemProps = QuestionnairePrimitive.ItemProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ItemProps = $props();
</script>

<QuestionnairePrimitive.Item
	bind:ref
	data-slot="questionnaire-item"
	class={cn("group/questionnaire-item flex min-w-0 flex-col gap-5 border-0 p-0 outline-none", className)}
	{...restProps}
/>
