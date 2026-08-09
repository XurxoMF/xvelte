<script lang="ts" module>
	export const rootVariants = tv({
		base: "relative flex cursor-grab touch-none rounded-full border border-transparent bg-muted shadow-inner transition-[color,border-color,box-shadow] duration-150 ease-out select-none hover:ring-2 hover:ring-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing active:border-ring active:ring-2 active:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
		variants: {
			size: {
				sm: "size-8",
				default: "size-12",
				lg: "size-16",
				xl: "size-24"
			}
		},
		defaultVariants: { size: "default" }
	});

	export type RootSizes = VariantProps<typeof rootVariants>["size"];
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: number | undefined;
		min?: number | undefined;
		max?: number | undefined;
		step?: number | undefined;
		disabled?: boolean | undefined;
		size?: RootSizes | undefined;
		label?: string | undefined;
		onValueChange?: ((value: number) => void) | undefined;
	};
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	import { cn, type WithElementRef } from "$lib/utils";

	let {
		ref = $bindable(null),
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		size = "default",
		label,
		onValueChange,
		class: className,
		...restProps
	}: RootProps = $props();

	const MIN_ANGLE = -135;
	const MAX_ANGLE = 135;
	const BODY_CLASSES = {
		sm: "inset-0.5 [&>span]:top-0.5 [&>span]:h-2 [&>span]:w-0.5",
		default: "inset-1 [&>span]:top-1 [&>span]:h-3 [&>span]:w-0.5",
		lg: "inset-1.5 [&>span]:top-1.5 [&>span]:h-4 [&>span]:w-0.5",
		xl: "inset-2 [&>span]:top-2 [&>span]:h-6 [&>span]:w-1"
	} as const;

	let dragging = false;
	let startY = 0;
	let startValue = 0;

	const normalized = $derived(max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min))));
	const angle = $derived(MIN_ANGLE + normalized * (MAX_ANGLE - MIN_ANGLE));

	function arcPoint(angle: number) {
		const radians = ((angle - 90) * Math.PI) / 180;
		return { x: 50 + 40 * Math.cos(radians), y: 50 + 40 * Math.sin(radians) };
	}

	function arcPath(endAngle: number) {
		const start = arcPoint(MIN_ANGLE);
		const end = arcPoint(endAngle);
		return `M ${start.x} ${start.y} A 40 40 0 ${endAngle - MIN_ANGLE > 180 ? 1 : 0} 1 ${end.x} ${end.y}`;
	}

	function updateValue(next: number) {
		const snapped = step > 0 ? min + Math.round((next - min) / step) * step : next;
		value = Math.max(min, Math.min(max, snapped));
		onValueChange?.(value);
	}

	function handlePointerDown(event: PointerEvent) {
		if (disabled) return;
		dragging = true;
		startY = event.clientY;
		startValue = value;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging || disabled) return;
		updateValue(startValue - ((event.clientY - startY) / 200) * (max - min));
	}

	function handlePointerUp(event: PointerEvent) {
		dragging = false;
		const target = event.currentTarget as HTMLElement;
		if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return;
		const next =
			event.key === "ArrowUp" || event.key === "ArrowRight"
				? value + step
				: event.key === "ArrowDown" || event.key === "ArrowLeft"
					? value - step
					: event.key === "Home"
						? min
						: event.key === "End"
							? max
							: value;
		if (next === value) return;
		event.preventDefault();
		updateValue(next);
	}
</script>

<div bind:this={ref} data-slot="knob" class={cn("relative inline-flex flex-col items-center gap-1", className)} {...restProps}>
	{#if label}<span class="text-xs text-muted-foreground">{label}</span>{/if}
	<button
		type="button"
		data-slot="knob-control"
		class={rootVariants({ size })}
		{disabled}
		role="slider"
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-label={label ?? "Knob"}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		onkeydown={handleKeyDown}
	>
		<svg viewBox="0 0 100 100" class="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
			<path d={arcPath(MAX_ANGLE)} fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="text-muted-foreground/20" />
			{#if normalized > 0}
				<path d={arcPath(angle)} fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="text-primary opacity-70" />
			{/if}
		</svg>
		<span
			class={cn("absolute rounded-full border border-border bg-card shadow-sm transition-transform duration-100 ease-out", BODY_CLASSES[size])}
			style:transform="rotate({angle}deg)"
		>
			<span class="absolute left-1/2 -translate-x-1/2 rounded-full bg-primary"></span>
		</span>
	</button>
</div>
