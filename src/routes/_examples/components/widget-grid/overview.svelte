<script lang="ts">
	import { onMount } from "svelte";

	import * as WidgetGrid from "$lib/components/ui/widget-grid";
	import * as Card from "$lib/components/ui/card";

	const storageKey = "widget-grid-overview-layout";

	type Widget = {
		id: string;
		title: string;
		description: string;
	};

	const widgets: Widget[] = [
		{ id: "activity-1", title: "Recent activity 1", description: "No new events 1." },
		{ id: "activity-2", title: "Recent activity 2", description: "No new events 2." }
	];

	const initialLayout: WidgetGrid.WidgetGridItemState[] = [
		{ id: "activity-1", x: 0, y: 0, width: 2, height: 2 },
		{ id: "activity-2", x: 2, y: 0, width: 3, height: 3 }
	];

	let layout = $state<WidgetGrid.WidgetGridItemState[]>(initialLayout.map((item) => ({ ...item })));

	const renderedWidgets = $derived(
		widgets.map((widget) => ({
			...widget,
			...(layout.find((item) => item.id === widget.id) ?? initialLayout.find((item) => item.id === widget.id))
		}))
	);

	function isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === "object" && value !== null;
	}

	function readInteger(value: unknown, fallback: number, minimum: number) {
		return typeof value === "number" && Number.isInteger(value) && value >= minimum ? value : fallback;
	}

	function restoreLayout(value: unknown) {
		if (!Array.isArray(value)) return;

		layout = initialLayout.map((initial) => {
			const stored = value.find((candidate) => isRecord(candidate) && candidate.id === initial.id);
			if (!isRecord(stored)) return { ...initial };

			return {
				id: initial.id,
				x: readInteger(stored.x, initial.x ?? 0, 0),
				y: readInteger(stored.y, initial.y ?? 0, 0),
				width: readInteger(stored.width, initial.width ?? 1, 1),
				height: readInteger(stored.height, initial.height ?? 1, 1)
			};
		});
	}

	function saveLayout(_state: WidgetGrid.WidgetGridItemState, states: WidgetGrid.WidgetGridItemState[]) {
		layout = states.map(({ id, x, y, width, height }) => ({ id, x, y, width, height }));

		try {
			localStorage.setItem(storageKey, JSON.stringify(layout));
		} catch {
			// The interactive example remains usable when browser storage is unavailable.
		}
	}

	onMount(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (stored !== null) restoreLayout(JSON.parse(stored));
		} catch {
			// Ignore malformed data and browsers where storage access is unavailable.
		}
	});
</script>

<WidgetGrid.Root columns={{ "2xl": 14, xl: 12, lg: 10, md: 8, sm: 6, xs: 4 }} gap={12} onMoveEnd={saveLayout} onResizeEnd={saveLayout}>
	{#each renderedWidgets as widget (widget.id)}
		<WidgetGrid.Item id={widget.id} x={widget.x} y={widget.y} width={widget.width} height={widget.height}>
			<Card.Root class="size-full">
				<Card.Header class="flex items-center gap-2">
					<WidgetGrid.DragHandle aria-label={`Move ${widget.title}`} />

					<Card.Title>{widget.title}</Card.Title>
				</Card.Header>

				<Card.Content>Anything you want to render in here... it's just a regular container.</Card.Content>

				<WidgetGrid.ResizeHandle aria-label={`Resize ${widget.title}`} />
			</Card.Root>
		</WidgetGrid.Item>
	{/each}
</WidgetGrid.Root>
