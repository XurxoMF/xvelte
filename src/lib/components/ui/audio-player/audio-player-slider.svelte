<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type SliderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { getAudioPlayerContext } from "./audio-player-context.svelte";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: SliderProps = $props();
	const ctx = getAudioPlayerContext();

	let progress = $derived(ctx.duration > 0 ? (ctx.currentTime / ctx.duration) * 100 : 0);
</script>

<div
	bind:this={ref}
	class={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-secondary has-focus-visible:ring-3 has-focus-visible:ring-ring/50", className)}
	data-slot="audio-player-slider"
	{...restProps}
>
	<div class="absolute top-0 left-0 h-full bg-primary" style="width: {progress}%"></div>
	<input
		type="range"
		min="0"
		max={ctx.duration}
		step="0.01"
		value={ctx.currentTime}
		oninput={(e) => ctx.seek(parseFloat(e.currentTarget.value))}
		class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
	/>
</div>
