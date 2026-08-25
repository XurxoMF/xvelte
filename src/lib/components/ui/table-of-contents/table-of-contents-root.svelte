<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";
	import type { Heading } from "$lib/hooks/use-toc.svelte";

	export type RootProps = WithElementRef<HTMLAttributes<HTMLUListElement>, HTMLUListElement> & {
		toc: Heading[];
		isChild?: boolean | undefined;
	};
</script>

<script lang="ts">
	import Self from "./table-of-contents-root.svelte";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), toc, isChild = false, class: className, ...restProps }: RootProps = $props();
</script>

<ul bind:this={ref} data-slot="table-of-contents" class={cn("m-0 list-none text-sm font-medium", { "pl-4": isChild }, className)} {...restProps}>
	{#each toc as heading, i (i)}
		<li
			class={cn("mt-0 pt-2 text-muted-foreground transition-all", {
				"text-foreground": heading.active
			})}
		>
			{#if heading.id}
				<a href="#{heading.id}" class="block hover:text-foreground">
					{heading.label}
				</a>
			{:else}
				{heading.label}
			{/if}
		</li>
		{#if heading.children.length > 0}
			<Self toc={heading.children} isChild={true} />
		{/if}
	{/each}
</ul>
