<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	/** Props accepted by a Questionnaire freeform answer input. */
	export type InputProps = QuestionnairePrimitive.InputProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: InputProps = $props();
</script>

<div data-slot="questionnaire-input-wrapper" class="group/questionnaire-input relative w-full min-w-0">
	<QuestionnairePrimitive.Input
		bind:ref
		data-slot="questionnaire-input"
		class={cn(
			"min-h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow,background-color] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 sm:min-h-0 md:text-sm dark:bg-input/30 dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40",
			className
		)}
		{...restProps}
	/>
</div>
