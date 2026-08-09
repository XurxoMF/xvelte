<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		x: number;
		y: number;
		color?: string;
		name?: string;
		message?: string;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), x, y, color = "#000", name, message, class: className, children, ...restProps }: RootProps = $props();
</script>

<div
	bind:this={ref}
	class={cn("pointer-events-none absolute top-0 left-0 z-50 transition-transform duration-100 ease-linear will-change-transform", className)}
	data-slot="cursor"
	style:transform={`translate3d(${x}px, ${y}px, 0)`}
	{...restProps}
>
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="relative -top-[1px] -left-[1px] drop-shadow-sm"
	>
		<path d="M3 3L9.5 20.5L12.5 13.5L19.5 10.5L3 3Z" fill={color} stroke={color} stroke-width="1" stroke-linejoin="round" />
	</svg>

	{#if name || message || children}
		<div
			class="absolute top-5 left-3.5 min-w-[max-content] animate-in rounded-xl rounded-tl-none px-3 py-1.5 shadow-sm duration-200 zoom-in-95 fade-in"
			style:background-color={color}
		>
			<div class="flex flex-col text-xs leading-relaxed text-white">
				{#if name}
					<span class="font-bold">{name}</span>
				{/if}
				{#if message}
					<span class="font-medium opacity-90">{message}</span>
				{/if}
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	{/if}
</div>
