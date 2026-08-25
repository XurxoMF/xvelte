<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type Orientation = "horizontal" | "vertical";
	export type RootProps = { value?: number | undefined; orientation?: Orientation | undefined; class?: string | undefined; children: Snippet };
</script>

<script lang="ts">
	import { setCompareContext } from "./compare-slider-context";

	import { cn } from "$lib/utils";

	let { value = $bindable(50), orientation = "horizontal", class: className, children }: RootProps = $props();

	let container: HTMLDivElement | undefined = $state();
	let isDragging = $state(false);

	/** @param e - Primary pointer event beginning a drag and capturing the pointer. */
	function handleDown(e: PointerEvent) {
		if (e.button !== 0 && e.pointerType === "mouse") return;

		isDragging = true;
		updatePosition(e.clientX, e.clientY);

		(e.target as Element).setPointerCapture(e.pointerId);
	}

	/** @param e - Captured pointer event used to update an active drag. */
	function handleMove(e: PointerEvent) {
		if (!isDragging) return;
		updatePosition(e.clientX, e.clientY);
	}

	/** @param e - Pointer event ending the drag and releasing capture. */
	function handleUp(e: PointerEvent) {
		isDragging = false;
		(e.target as Element).releasePointerCapture(e.pointerId);
	}

	/**
	 * Converts viewport coordinates into a clamped percentage along the configured axis.
	 *
	 * @param clientX - Horizontal pointer coordinate in viewport pixels.
	 * @param clientY - Vertical pointer coordinate in viewport pixels.
	 */
	function updatePosition(clientX: number, clientY: number) {
		if (!container) return;

		const rect = container.getBoundingClientRect();

		if (orientation === "horizontal") {
			const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
			value = (x / rect.width) * 100;
		} else {
			const y = Math.min(Math.max(0, clientY - rect.top), rect.height);
			value = (y / rect.height) * 100;
		}
	}

	/** @param e - Keyboard event used for stepped or boundary slider movement. */
	function handleKeyDown(e: KeyboardEvent) {
		const step = e.shiftKey ? 10 : 1;
		if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			value = Math.max(0, value - step);
		} else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			value = Math.min(100, value + step);
		} else if (e.key === "Home") {
			e.preventDefault();
			value = 0;
		} else if (e.key === "End") {
			e.preventDefault();
			value = 100;
		}
	}

	setCompareContext({
		get position() {
			return value;
		},
		get orientation() {
			return orientation;
		},
		get isDragging() {
			return isDragging;
		}
	});
</script>

<div
	bind:this={container}
	data-slot="compare-slider"
	role="slider"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={100}
	tabindex="0"
	onpointerdown={handleDown}
	onpointermove={handleMove}
	onpointerup={handleUp}
	onkeydown={handleKeyDown}
	class={cn(
		"group relative touch-none overflow-hidden rounded-[inherit] select-none",
		orientation === "horizontal" ? "cursor-ew-resize" : "cursor-ns-resize",
		className
	)}
	style="--pos: {value}%"
>
	{@render children()}
</div>
