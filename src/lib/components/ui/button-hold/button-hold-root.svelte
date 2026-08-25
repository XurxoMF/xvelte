<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { WithoutChildren } from "bits-ui";

	import * as Button from "$lib/components/ui/button";

	/** Edge from which the progress fill expands. */
	export type HoldDirection = "top" | "bottom" | "left" | "right";

	/** Props for the hold-to-complete Button wrapper. */
	export type RootProps = WithoutChildren<Button.RootProps> & {
		/** Continuous hold duration in milliseconds. */
		duration?: number | undefined;
		/** Runs after the supported pointer hold reaches its duration. */
		onComplete?: (() => void) | undefined;
		/** Visible Button content. */
		children: Snippet;
		/** Tailwind classes applied to the internal progress fill. */
		fillColor?: string | undefined;
		/** Edge from which the progress fill expands. */
		from?: HoldDirection | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let {
		duration = 1000,
		onComplete,
		class: className,
		children,
		fillColor = "bg-black/10",
		from = "bottom",
		onmousedown,
		onmouseup,
		ontouchstart,
		ontouchend,
		...restProps
	}: RootProps = $props();

	let isHolding = $state(false);
	let completed = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	/** Starts the visual fill and schedules completion after the configured duration. */
	function startHold() {
		if (completed) return;
		isHolding = true;

		timer = setTimeout(() => {
			if (isHolding) {
				completed = true;
				onComplete?.();
				setTimeout(() => {
					isHolding = false;
					completed = false;
				}, 200);
			}
		}, duration);
	}

	/** Cancels an incomplete hold and clears its completion timer. */
	function cancelHold() {
		if (completed) return;
		isHolding = false;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	const transformStyles = $derived.by(() => {
		switch (from) {
			case "top":
				return {
					origin: "origin-top",
					transform: `scaleY(${isHolding ? 1 : 0})`
				};
			case "left":
				return {
					origin: "origin-left",
					transform: `scaleX(${isHolding ? 1 : 0})`
				};
			case "right":
				return {
					origin: "origin-right",
					transform: `scaleX(${isHolding ? 1 : 0})`
				};
			case "bottom":
			default:
				return {
					origin: "origin-bottom",
					transform: `scaleY(${isHolding ? 1 : 0})`
				};
		}
	});
</script>

<Button.Root
	data-slot="button-hold"
	class={cn("relative overflow-hidden select-none", className)}
	onmousedown={(e) => {
		startHold();
		onmousedown?.(e);
	}}
	onmouseup={(e) => {
		cancelHold();
		onmouseup?.(e);
	}}
	onmouseleave={cancelHold}
	ontouchstart={(e) => {
		if (e.cancelable) e.preventDefault();
		startHold();
		ontouchstart?.(e);
	}}
	ontouchend={(e) => {
		cancelHold();
		ontouchend?.(e);
	}}
	{...restProps}
>
	<div
		class={cn("pointer-events-none absolute inset-0 z-0", transformStyles.origin, fillColor)}
		style:transform={transformStyles.transform}
		style:transition="transform {isHolding ? duration : 100}ms linear"
	></div>

	<span class="pointer-events-none relative z-10 flex items-center gap-2">
		{@render children()}
	</span>
</Button.Root>
