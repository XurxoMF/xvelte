<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type SeparatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { MinusIcon } from "$lib/icons";

	let { ref = $bindable(null), class: className, children, ...restProps }: SeparatorProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-otp-separator"
	role="separator"
	class={cn("flex items-center [&_svg:not([class*='size-'])]:size-4", className)}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<MinusIcon />
	{/if}
</div>
