<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		sensitivity?: number;
		damping?: number;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, sensitivity = 1.5, damping = 0.1, children, ...restProps }: RootProps = $props();

	let targetScroll = 0;
	let currentScroll = 0;
	let isAnimating = false;
	let animationFrame: number;

	onMount(() => {
		return () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
		};
	});

	function update() {
		if (!ref) return;

		const diff = targetScroll - currentScroll;

		if (Math.abs(diff) < 0.5) {
			currentScroll = targetScroll;
			ref.scrollLeft = currentScroll;
			isAnimating = false;
			return;
		}

		currentScroll += diff * damping;
		ref.scrollLeft = currentScroll;

		animationFrame = requestAnimationFrame(update);
	}

	function handleWheel(e: WheelEvent) {
		if (!ref) return;
		if (e.deltaY === 0) return;

		const maxScroll = ref.scrollWidth - ref.clientWidth;
		if (maxScroll <= 0) return;

		e.preventDefault();

		if (!isAnimating) {
			currentScroll = ref.scrollLeft;
			targetScroll = currentScroll;
			isAnimating = true;
			animationFrame = requestAnimationFrame(update);
		}

		targetScroll += e.deltaY * sensitivity;

		targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
	}
</script>

<div
	bind:this={ref}
	onwheel={handleWheel}
	class={cn("flex w-full overflow-x-auto overflow-y-hidden select-none", className)}
	style="scrollbar-width: none; -ms-overflow-style: none;"
	data-slot="horizontal-scroll"
	{...restProps}
>
	{@render children?.()}
</div>

<style>
	div::-webkit-scrollbar {
		display: none;
	}
</style>
