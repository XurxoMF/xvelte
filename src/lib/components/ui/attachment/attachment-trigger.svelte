<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	/** Props for the native or delegated full-card Attachment trigger. */
	export type TriggerProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		child?: Snippet<[{ props: Record<string, unknown> }]> | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, type = "button", child, ...restProps }: TriggerProps = $props();

	const mergedProps = $derived({
		class: cn("absolute inset-0 z-10", className),
		"data-slot": "attachment-trigger",
		...restProps
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<button bind:this={ref} {type} {...mergedProps}>
		{@render mergedProps.children?.()}
	</button>
{/if}
