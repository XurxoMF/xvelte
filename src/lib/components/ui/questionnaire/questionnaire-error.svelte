<script lang="ts" module>
	import { Questionnaire as QuestionnairePrimitive } from "@shadcn-svelte/primitives/questionnaire";

	/** Props accepted by a Questionnaire item's validation message. */
	export type ErrorProps = QuestionnairePrimitive.ErrorProps;
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, child: childProp, ...restProps }: ErrorProps = $props();
</script>

<QuestionnairePrimitive.Error bind:ref data-slot="questionnaire-error" {...restProps}>
	{#snippet child(state)}
		{#if childProp}
			{@render childProp({ ...state, props: { ...state.props, class: cn("text-sm text-danger", className) } })}
		{:else}
			<p {...state.props} class={cn("text-sm text-danger", className)}>
				{#if children}
					{@render children()}
				{:else}
					<span class="group-data-[required]/questionnaire-item:hidden">{m.vivid_brook_choose_or_skip()}</span>
					<span class="hidden group-data-[required]/questionnaire-item:inline">{m.wise_marten_choose_answer()}</span>
				{/if}
			</p>
		{/if}
	{/snippet}
</QuestionnairePrimitive.Error>
