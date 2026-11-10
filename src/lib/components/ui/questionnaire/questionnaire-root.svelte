<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	/** Props accepted by the Questionnaire form root. */
	export type RootProps = QuestionnairePrimitive.RootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), item = $bindable(undefined), class: className, ...restProps }: RootProps = $props();
</script>

<QuestionnairePrimitive.Root
	bind:ref
	bind:item
	data-slot="questionnaire"
	class={cn("flex w-full min-w-0 flex-col gap-6", className)}
	{...restProps}
/>
