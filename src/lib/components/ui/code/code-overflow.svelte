<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithChildren, WithoutChildren } from "bits-ui";

	export type OverflowProps = WithChildren<{
		ref?: HTMLDivElement | null | undefined;
		collapsed?: boolean | undefined;
	}> &
		WithoutChildren<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	import * as Button from "$lib/components/ui/button";

	let { ref = $bindable(null), collapsed = $bindable(true), class: className, children, ...restProps }: OverflowProps = $props();

	const managedTabindexes: [element: HTMLElement, tabindex: string | null][] = [];

	/** Removes collapsed code controls from sequential keyboard focus while remembering their latest tabindex. */
	function suppressInternalTabindexes() {
		if (!ref) return;

		for (const element of ref.querySelectorAll<HTMLElement>('[data-slot="scroll-area-viewport"], [data-slot="code-copy-button"]')) {
			const tabindex = element.getAttribute("tabindex");

			if (tabindex === "-1") continue;

			const managedTabindex = managedTabindexes.find(([managedElement]) => managedElement === element);

			if (managedTabindex) managedTabindex[1] = tabindex;
			else managedTabindexes.push([element, tabindex]);

			element.setAttribute("tabindex", "-1");
		}
	}

	/** Restores the tabindex values owned by descendants before Overflow suppressed them. */
	function restoreInternalTabindexes() {
		for (const [element, tabindex] of managedTabindexes) {
			if (tabindex === null) element.removeAttribute("tabindex");
			else element.setAttribute("tabindex", tabindex);
		}

		managedTabindexes.length = 0;
	}

	$effect(() => {
		if (!ref || !collapsed) {
			restoreInternalTabindexes();
			return;
		}

		suppressInternalTabindexes();

		// Bits UI updates Viewport's tabindex when overflow changes, and Shiki renders asynchronously.
		const observer = new MutationObserver(suppressInternalTabindexes);
		observer.observe(ref, { subtree: true, childList: true, attributes: true, attributeFilter: ["tabindex"] });

		return () => {
			observer.disconnect();
			restoreInternalTabindexes();
		};
	});
</script>

<div
	{...restProps}
	bind:this={ref}
	data-slot="code-overflow"
	data-code-overflow
	data-collapsed={collapsed}
	class={cn("relative overflow-y-hidden data-[collapsed=true]:max-h-75", className)}
>
	{@render children?.()}
	{#if collapsed}
		<div class="absolute bottom-0 left-0 z-10 h-full w-full bg-linear-to-t from-background to-transparent"></div>
	{/if}
	{#if collapsed}
		<Button.Root variant="secondary" size="sm" class="absolute bottom-2 left-1/2 z-20 w-fit -translate-x-1/2" onclick={() => (collapsed = false)}>
			{m.deep_lotus_expand()}
		</Button.Root>
	{/if}
</div>
