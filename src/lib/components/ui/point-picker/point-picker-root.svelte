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
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";

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
	const gridPositions = [20, 40, 60, 80];

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
	aria-label={label ?? m.olive_heron_point()}
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

	{#if showGrid}
		<div data-slot="point-picker-grid" aria-hidden="true" class="pointer-events-none absolute inset-0 z-10">
			{#each gridPositions as position (position)}
				<span data-slot="point-picker-grid-line" class="absolute inset-y-0 w-px bg-border/30" style:left={`${position}%`}></span>
				<span data-slot="point-picker-grid-line" class="absolute inset-x-0 h-px bg-border/30" style:top={`${position}%`}></span>
			{/each}
		</div>
	{/if}

	{#if showCrosshair}
		<div
			data-slot="point-picker-crosshair"
			aria-hidden="true"
			class="pointer-events-none absolute inset-y-0 z-10 w-px bg-primary/50"
			style:left={`${xPercent}%`}
		></div>
		<div
			data-slot="point-picker-crosshair"
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 z-10 h-px bg-primary/50"
			style:top={`${yPercent}%`}
		></div>
	{/if}

	{#if showCursor}
		<div
			data-slot="point-picker-cursor"
			aria-hidden="true"
			class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
			style:left={`${xPercent}%`}
			style:top={`${yPercent}%`}
		>
			{#if cursor}
				{@render cursor(currentValue)}
			{:else}
				<div class="relative size-5">
					<span data-slot="point-picker-cursor-glow" class="absolute inset-0 rounded-full bg-primary/30 blur-lg"></span>
					<span data-slot="point-picker-cursor-dot" class="absolute inset-1 rounded-full bg-primary shadow-lg shadow-primary/50"></span>
					<span data-slot="point-picker-cursor-highlight" class="absolute inset-2 rounded-full bg-primary-foreground/30"></span>
				</div>
			{/if}
		</div>
	{/if}

	{#if showValue}
		<div
			data-slot="point-picker-value"
			aria-live="polite"
			class="pointer-events-none absolute top-1.5 right-1.5 z-20 rounded-sm border border-border bg-background/80 px-2 py-1 font-mono text-xs text-muted-foreground backdrop-blur-sm"
		>
			{formattedValue}
		</div>
	{/if}
</div>
