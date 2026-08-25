<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: number | undefined;
		defaultValue?: number | undefined;
		min?: number | undefined;
		max?: number | undefined;
		step?: number | undefined;
		label?: string | undefined;
		size?: number | undefined;
		color?: string | undefined;
		disabled?: boolean | undefined;
		onValueChange?: ((value: number) => void) | undefined;
	};
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		value = $bindable(0),
		defaultValue,
		min = 0,
		max = 100,
		step = 1,
		label,
		size = 60,
		color = "var(--primary)",
		disabled = false,
		onValueChange,
		class: className,
		...restProps
	}: RootProps = $props();

	let isDragging = $state(false);
	let startY = 0;
	let startValue = 0;

	const safeValue = $derived(Math.min(max, Math.max(min, value)));
	const progress = $derived((safeValue - min) / (max - min || 1));
	const rotation = $derived(progress * 270 - 135);
	const circumference = 2 * Math.PI * 40;
	const arcLength = (270 / 360) * circumference;

	/** @param next - Candidate value to snap to the step and clamp to the bounds. */
	function updateValue(next: number) {
		value = Math.min(max, Math.max(min, Math.round(next / step) * step));
		onValueChange?.(value);
	}

	/** @param clientY - Current vertical pointer coordinate used to measure drag distance. */
	function handleMove(clientY: number) {
		if (!isDragging || disabled) return;
		updateValue(startValue + ((startY - clientY) / size) * (max - min) * 0.5);
	}

	/** @param event - Window mouse event forwarded to the shared drag calculation. */
	function handleMouseMove(event: MouseEvent) {
		handleMove(event.clientY);
	}

	/** Ends dragging and removes window-level mouse listeners. */
	function stopDragging() {
		isDragging = false;
		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", stopDragging);
	}

	/** @param clientY - Initial vertical coordinate used as the drag origin. */
	function startDragging(clientY: number) {
		if (disabled) return;
		isDragging = true;
		startY = clientY;
		startValue = value;
	}

	/** @param event - Arrow or boundary key used to update the knob. */
	function handleKeydown(event: KeyboardEvent) {
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

<div
	bind:this={ref}
	class={cn("flex flex-col items-center gap-2 select-none", disabled && "opacity-50 grayscale-[0.2]", className)}
	data-slot="knob"
	{...restProps}
>
	{#if label}<span class="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{label}</span>{/if}
	<div
		role="slider"
		tabindex={disabled ? undefined : 0}
		aria-label={label ?? m.navy_lynx_knob()}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-disabled={disabled}
		class={cn("relative flex items-center justify-center rounded-full", disabled ? "cursor-not-allowed" : "cursor-ns-resize")}
		style="width: {size}px; height: {size}px;"
		onmousedown={(event) => {
			startDragging(event.clientY);
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", stopDragging);
		}}
		ondblclick={() => !disabled && updateValue(defaultValue ?? min)}
		ontouchstart={(event) => startDragging(event.touches[0].clientY)}
		ontouchmove={(event) => handleMove(event.touches[0].clientY)}
		ontouchend={stopDragging}
		onkeydown={handleKeydown}
	>
		<svg class="absolute inset-0 size-full" viewBox="0 0 100 100" aria-hidden="true">
			<circle
				cx="50"
				cy="50"
				r="40"
				fill="none"
				stroke="currentColor"
				stroke-width="8"
				class="text-muted/20"
				stroke-dasharray="{arcLength} {circumference}"
				stroke-linecap="round"
				style="transform: rotate(135deg); transform-origin: 50% 50%;"
			/>

			<circle
				cx="50"
				cy="50"
				r="40"
				fill="none"
				stroke={color}
				stroke-width="8"
				stroke-dasharray="{progress * arcLength} {circumference}"
				stroke-linecap="round"
				style="transform: rotate(135deg); transform-origin: 50% 50%;"
			/>
		</svg>
		<div
			class="relative flex items-center justify-center rounded-full border bg-secondary"
			style="width: {size * 0.65}px; height: {size * 0.65}px; transform: rotate({rotation}deg);"
		>
			<div class="mt-1 mb-auto h-[35%] w-1 rounded-full opacity-90" style="background-color: {color};"></div>
		</div>
	</div>
	<span class="font-mono text-xs font-medium tracking-tighter text-foreground">{value}</span>
</div>
