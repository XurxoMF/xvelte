<script lang="ts">
	import type { SortableRenderState } from "$lib/components/ui/sortable";

	import * as Button from "$lib/components/ui/button";
	import * as Sortable from "$lib/components/ui/sortable";

	type Task = {
		id: number;
		label: string;
	};

	let tasks = $state<Task[]>([
		{ id: 1, label: "Confirm venue" },
		{ id: 2, label: "Send invitations" },
		{ id: 3, label: "Order supplies" }
	]);
	let savedOrder = $state("");

	function persistTaskOrder(ids: number[]) {
		savedOrder = ids.join(", ");
	}

	function updateOrder(next: Task[]) {
		tasks = next;
	}

	function saveOrder(next: Task[]) {
		tasks = next;
		void persistTaskOrder(next.map((task) => task.id));
	}
</script>

{#snippet taskItem(task: Task, state: SortableRenderState)}
	<Sortable.Item class="flex items-center gap-3 rounded-md border bg-background p-3" data-dragging={state.dragging || undefined}>
		<span class="flex-1">{task.label}</span>

		<Sortable.DragHandle>
			{#snippet child({ props })}
				<Button.Root {...props} variant="ghost" size="sm" class="cursor-grab active:cursor-grabbing" aria-label={`Move ${task.label}`}>
					Drag
				</Button.Root>
			{/snippet}
		</Sortable.DragHandle>
	</Sortable.Item>
{/snippet}

<Sortable.Root items={tasks} item={taskItem} onConsider={updateOrder} onDrop={saveOrder} />

{#if savedOrder}<p class="mt-3 text-sm text-muted-foreground">Saved order: {savedOrder}</p>{/if}
