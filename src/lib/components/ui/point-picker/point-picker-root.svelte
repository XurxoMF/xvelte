<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	import type { Point } from "./point-picker-utils";

	export type RootProps = Omit<WithElementRef<HTMLAttributes<HTMLDivElement>>, "children"> & {
		value?: Point | undefined;
		defaultValue?: Point | undefined;
		minX?: number | undefined;
		maxX?: number | undefined;
		minY?: number | undefined;
		maxY?: number | undefined;
		stepX?: number | undefined;
		stepY?: number | undefined;
		disabled?: boolean | undefined;
		label?: string | undefined;
		showGrid?: boolean | undefined;
		showCrosshair?: boolean | undefined;
		showCursor?: boolean | undefined;
		showValue?: boolean | undefined;
		formatValue?: ((value: Point) => string) | undefined;
		onValueChange?: ((value: Point) => void) | undefined;
		onValueCommit?: ((value: Point) => void) | undefined;
		children?: Snippet | undefined;
		cursor?: Snippet<[Point]> | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import Indicators from "./point-picker-indicators.svelte";
	import { clamp, getKeyboardValue, quantize, type RootEvent } from "./point-picker-utils";

	let {
		ref = $bindable(null),
		value = $bindable(),
		defaultValue,
		minX = 0,
		maxX = 100,
		minY = 0,
		maxY = 100,
		stepX = 1,
		stepY = 1,
		disabled = false,
		label,
		showGrid = false,
		showCrosshair = false,
		showCursor = true,
		showValue = false,
		formatValue,
		onValueChange,
		onValueCommit,
		onpointerdown,
		onpointermove,
		onpointerup,
		onpointercancel,
		onkeydown,
		children,
		cursor,
		class: className,
		...restProps
	}: RootProps = $props();

	let dragging = false;
	const fallbackValue = $derived(defaultValue ?? { x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
	const currentValue = $derived(value ?? fallbackValue);
	const xPercent = $derived(maxX === minX ? 0 : (100 * (currentValue.x - minX)) / (maxX - minX));
	const yPercent = $derived(maxY === minY ? 0 : 100 - (100 * (currentValue.y - minY)) / (maxY - minY));
	const formattedValue = $derived(formatValue?.(currentValue) ?? `${currentValue.x.toFixed(0)}, ${currentValue.y.toFixed(0)}`);

	/** @param next - Candidate point to quantize, clamp, and publish. */
	function updateValue(next: Point) {
		value = {
			x: clamp(quantize(next.x, minX, stepX), minX, maxX),
			y: clamp(quantize(next.y, minY, stepY), minY, maxY)
		};
		onValueChange?.(value);
		return value;
	}

	/** @param event - Pointer event whose viewport coordinates are mapped into value bounds. */
	function valueFromPointer(event: RootEvent<PointerEvent>) {
		const bounds = event.currentTarget.getBoundingClientRect();
		return {
			x: minX + clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * (maxX - minX),
			y: maxY - clamp((event.clientY - bounds.top) / bounds.height, 0, 1) * (maxY - minY)
		};
	}

	/** @param event - Pointer event beginning a captured drag. */
	function handlePointerDown(event: RootEvent<PointerEvent>) {
		onpointerdown?.(event);
		if (disabled || event.defaultPrevented) return;
		event.preventDefault();
		dragging = true;
		event.currentTarget.setPointerCapture(event.pointerId);
		updateValue(valueFromPointer(event));
	}

	/** @param event - Captured pointer event updating an active drag. */
	function handlePointerMove(event: RootEvent<PointerEvent>) {
		onpointermove?.(event);
		if (dragging && !disabled) updateValue(valueFromPointer(event));
	}

	/** @param event - Pointer event committing the final dragged value. */
	function handlePointerUp(event: RootEvent<PointerEvent>) {
		onpointerup?.(event);
		if (!dragging) return;
		dragging = false;
		const target = event.currentTarget;
		const committed = updateValue(valueFromPointer(event));
		if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
		onValueCommit?.(committed);
	}

	/** @param event - Arrow, page, or boundary key used to move and commit the point. */
	function handleKeyDown(event: RootEvent<KeyboardEvent>) {
		onkeydown?.(event);
		if (disabled || event.defaultPrevented) return;
		const next = getKeyboardValue(event.key, currentValue, { minX, maxX, minY, maxY, stepX, stepY });
		if (!next) return;
		event.preventDefault();
		onValueCommit?.(updateValue(next));
	}

	/** @param event - Cancelled pointer event forwarded before ending the drag. */
	function handlePointerCancel(event: RootEvent<PointerEvent>) {
		onpointercancel?.(event);
		dragging = false;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={ref}
	data-slot="point-picker"
	data-disabled={disabled ? "true" : undefined}
	role="application"
	tabindex={disabled ? -1 : 0}
	aria-label={label ?? "Point picker"}
	aria-disabled={disabled}
	class={cn(
		"relative block w-full touch-none overflow-hidden outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
		className
	)}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onkeydown={handleKeyDown}
	{...restProps}
>
	<div data-slot="point-picker-content" class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
		{@render children?.()}
	</div>

	<Indicators value={currentValue} {xPercent} {yPercent} {formattedValue} {showGrid} {showCrosshair} {showCursor} {showValue} {cursor} />
</div>
