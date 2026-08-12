<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	import type { WithChildren, WithoutChildren } from "bits-ui";

	import type { WithElementRef } from "$lib/utils";

	export type FileProps = WithElementRef<WithoutChildren<HTMLButtonAttributes>, HTMLButtonElement> &
		WithChildren<{
			name: string;
			icon?: Snippet<[{ name: string }]> | undefined;
		}>;
</script>

<script lang="ts">
	import { FileIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), name, icon, type = "button", class: className, ...restProps }: FileProps = $props();
</script>

<button
	bind:this={ref}
	{type}
	role="treeitem"
	data-slot="tree-view-file"
	class={cn("flex place-items-center gap-1 pl-0.75", className)}
	{...restProps}
>
	{#if icon}
		{@render icon({ name })}
	{:else}
		<FileIcon class="size-4" />
	{/if}
	<span>{name}</span>
</button>
