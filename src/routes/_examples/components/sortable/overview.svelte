<script lang="ts">
	import { onMount } from "svelte";

	import * as Sortable from "$lib/components/ui/sortable";

	const storageKey = "sortable-overview-order";

	type Task = {
		id: number;
		label: string;
	};

	const tasks: Task[] = [
		{ id: 1, label: "1. Confirm venue" },
		{ id: 2, label: "2. Send invitations" },
		{ id: 3, label: "3. Order supplies" }
	];

	let order = $state<number[]>(tasks.map((task) => task.id));

	const orderedTasks = $derived(Sortable.orderItems(tasks, order, (task) => task.id));

	onMount(() => {
		try {
			const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");

			if (Array.isArray(stored)) {
				order = Sortable.orderItems(tasks, stored, (task) => task.id).map((task) => task.id);
			}
		} catch {
			localStorage.removeItem(storageKey);
		}
	});

	function saveOrder() {
		try {
			localStorage.setItem(storageKey, JSON.stringify(order));
		} catch {
			// Storage may be unavailable or full.
		}
	}
</script>

<div class="flex flex-col gap-4">
	<Sortable.Root class="flex flex-col gap-4" bind:order onDragEnd={saveOrder}>
		{#each orderedTasks as task (task.id)}
			<Sortable.Item id={task.id} class="flex items-center gap-3 rounded-md border bg-background p-3 data-dragging:opacity-60">
				<span class="flex-1">{task.label}</span>

				<Sortable.DragHandle aria-label={`Move ${task.label}`} />
			</Sortable.Item>
		{/each}
	</Sortable.Root>
</div>
