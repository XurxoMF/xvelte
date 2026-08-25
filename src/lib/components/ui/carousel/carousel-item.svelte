<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type ItemProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import * as Carousel from ".";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: ItemProps = $props();

	const emblaCtx = Carousel.getEmblaContext("<Carousel.Item/>");
</script>

<div
	bind:this={ref}
	data-slot="carousel-item"
	role="group"
	aria-roledescription={m.round_larch_slide()}
	class={cn("min-w-0 shrink-0 grow-0 basis-full", emblaCtx.orientation === "horizontal" ? "ps-4" : "pt-4", className)}
	data-embla-slide=""
	{...restProps}
>
	{@render children?.()}
</div>
