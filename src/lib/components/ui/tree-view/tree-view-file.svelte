<script lang="ts">
	import { cn } from "$lib/utils";
	import { FileIcon } from "$lib/icons";

	import type { TreeViewFileProps } from "./types";

	let { ref = $bindable(null), name, icon, type = "button", class: className, ...restProps }: TreeViewFileProps = $props();
</script>

<button
	bind:this={ref}
	{type}
	role="treeitem"
	data-slot="tree-view-file"
	class={cn("flex place-items-center gap-1 pl-[3px]", className)}
	{...restProps}
>
	{#if icon}
		{@render icon({ name })}
	{:else}
		<FileIcon class="size-4" />
	{/if}
	<span>{name}</span>
</button>
