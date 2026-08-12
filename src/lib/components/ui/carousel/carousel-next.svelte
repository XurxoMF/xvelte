<script lang="ts" module>
	export type NextProps = WithoutChildren<Button.RootProps>;
</script>

<script lang="ts">
	import type { WithoutChildren } from "bits-ui";

	import { ChevronRightIcon } from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";

	import * as Button from "$lib/components/ui/button";

	import * as Carousel from ".";

	let { ref = $bindable(null), class: className, variant = "outline", size = "icon-sm", ...restProps }: NextProps = $props();

	const emblaCtx = Carousel.getEmblaContext("<Carousel.Next/>");
</script>

<Button.Root
	data-slot="carousel-next"
	{variant}
	{size}
	aria-disabled={!emblaCtx.canScrollNext}
	disabled={!emblaCtx.canScrollNext}
	class={cn(
		"absolute touch-manipulation rounded-full",
		emblaCtx.orientation === "horizontal" ? "inset-y-0 -inset-e-12 my-auto" : "inset-s-1/2 -bottom-12 -translate-x-1/2 rotate-90",
		className
	)}
	onclick={emblaCtx.scrollNext}
	onkeydown={emblaCtx.handleKeyDown}
	bind:ref
	{...restProps}
>
	<ChevronRightIcon />
	<span class="sr-only">{m.crisp_hare_forward()}</span>
</Button.Root>
