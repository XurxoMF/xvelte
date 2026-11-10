<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	/** Props accepted by the Questionnaire progress indicator. */
	export type ProgressProps = QuestionnairePrimitive.ProgressProps;
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		"aria-label": ariaLabel = m.steady_finch_questionnaire_progress(),
		children,
		child: childProp,
		...restProps
	}: ProgressProps = $props();
</script>

<QuestionnairePrimitive.Progress bind:ref data-slot="questionnaire-progress" aria-label={ariaLabel} {...restProps}>
	{#snippet child(state)}
		{#if childProp}
			{@render childProp({
				...state,
				props: {
					...state.props,
					"aria-label": ariaLabel,
					"aria-valuetext": state.total ? m.tender_fox_question_progress({ current: state.current, total: state.total }) : undefined,
					class: cn("min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums", className)
				}
			})}
		{:else}
			<div
				{...state.props}
				aria-label={ariaLabel}
				aria-valuetext={state.total ? m.tender_fox_question_progress({ current: state.current, total: state.total }) : undefined}
				class={cn("min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums", className)}
			>
				{#if children}
					{@render children()}
				{:else if state.total}
					{m.tender_fox_question_progress({ current: state.current, total: state.total })}
				{/if}
			</div>
		{/if}
	{/snippet}
</QuestionnairePrimitive.Progress>
