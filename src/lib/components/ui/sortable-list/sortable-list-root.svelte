<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithoutChildren } from "bits-ui";

	import type { WithElementRef } from "$lib/utils";

	export type SortableItem = {
		id: string | number;
	};

	export type RootProps<Item extends SortableItem = SortableItem> = WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		items: Item[];
		item: Snippet<[Item]>;
		onDrop?: (items: Item[]) => void;
		flipDuration?: number;
	};
</script>

<script lang="ts" generics="Item extends SortableItem">
	import { tick } from "svelte";
	import { flip } from "svelte/animate";

	import { SHADOW_ITEM_MARKER_PROPERTY_NAME, dragHandleZone } from "svelte-dnd-action";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, items, item, onDrop, flipDuration = 150, ...restProps }: RootProps<Item> = $props();

	let isDragging = $state(false);
	let dndItems = $state<Item[]>([]);

	$effect(() => {
		if (isDragging) return;
		const needsSync = dndItems.length !== items.length || dndItems.some((item, i) => item.id !== items[i]?.id);
		if (needsSync) {
			dndItems = [...items];
		}
	});

	function handleConsider(e: CustomEvent<{ items: Item[] }>) {
		isDragging = true;
		dndItems = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent<{ items: Item[] }>) {
		const finalItems = e.detail.items.filter((item) => !(item as Item & Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
		dndItems = finalItems;
		onDrop?.(finalItems);

		await tick();
		isDragging = false;
	}
</script>

<div
	bind:this={ref}
	use:dragHandleZone={{ items: dndItems, flipDurationMs: flipDuration, dropTargetStyle: {} }}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
	class={cn("flex flex-col gap-1", className)}
	data-slot="sortable-list"
	{...restProps}
>
	{#each dndItems as entry (entry.id)}
		<div animate:flip={{ duration: flipDuration }} data-slot="sortable-list-entry">
			{@render item(entry)}
		</div>
	{/each}
</div>
