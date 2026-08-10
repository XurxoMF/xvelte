<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type HoldDirection = "top" | "bottom" | "left" | "right";
	export type RootProps = WithoutChildren<ButtonProps> & {
		duration?: number | undefined;
		onComplete?: (() => void) | undefined;
		children: Snippet;
		fillColor?: string | undefined;
		from?: HoldDirection | undefined;
	};
</script>

<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import { cn } from "$lib/utils";

	let {
		duration = 1500,
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
	data-slot="hold-button"
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
