<script lang="ts" module>
	export type RootProps = WithoutChildrenOrChild<SliderPrimitive.RootProps> & {
		/** Buffered value in the same scale as `min` and `max`. */
		bufferValue?: number | undefined;
	};
</script>

<script lang="ts">
	import { Slider as SliderPrimitive } from "bits-ui";

	import { cn, type WithoutChildrenOrChild } from "$lib/utils";

	let {
		ref = $bindable(null),
		value = $bindable(),
		bufferValue,
		min = 0,
		max = 100,
		orientation = "horizontal",
		class: className,
		...restProps
	}: RootProps = $props();

	const bufferPercent = $derived(max === min ? 0 : Math.max(0, Math.min(100, (100 * ((bufferValue ?? min) - min)) / (max - min))));
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="slider"
	{orientation}
	{min}
	{max}
	class={cn(
		"relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
		className
	)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span
			data-slot="slider-track"
			data-orientation={orientation}
			class={cn(
				"relative grow overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
			)}
		>
			{#if bufferValue !== undefined}
				<span
					data-slot="slider-buffer"
					data-orientation={orientation}
					class="absolute bg-primary/30 transition-[width,height] data-horizontal:left-0 data-horizontal:h-full data-vertical:bottom-0 data-vertical:w-full"
					style={orientation === "horizontal" ? `width: ${bufferPercent}%` : `height: ${bufferPercent}%`}
				></span>
			{/if}
			<SliderPrimitive.Range data-slot="slider-range" class={cn("absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full")} />
		</span>
		{#each thumbItems as thumb (thumb.index)}
			<SliderPrimitive.Thumb
				data-slot="slider-thumb"
				index={thumb.index}
				class="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
