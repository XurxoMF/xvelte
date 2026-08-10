<script lang="ts" module>
	import type { Snippet } from "svelte";

	import type { WithChildren } from "bits-ui";

	export type FolderProps = WithChildren<{
		name: string;
		open?: boolean | undefined;
		class?: string | undefined;
		icon?: Snippet<[{ name: string; open: boolean }]> | undefined;
	}>;
</script>

<script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible";
	import { FolderIcon, FolderOpenIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	let { name, open = $bindable(true), class: className, icon, children }: FolderProps = $props();
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger role="treeitem" data-slot="tree-view-folder" class={cn("flex place-items-center gap-1", className)}>
		{#if icon}
			{@render icon({ name, open })}
		{:else if open}
			<FolderOpenIcon class="size-4" />
		{:else}
			<FolderIcon class="size-4" />
		{/if}
		<span>{name}</span>
	</Collapsible.Trigger>
	<Collapsible.Content role="group" data-slot="tree-view-folder-content" class="ml-2 border-l">
		<div class="relative flex place-items-start">
			<div class="mx-2 h-full w-px bg-border"></div>
			<div class="flex flex-1 flex-col">
				{@render children?.()}
			</div>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
