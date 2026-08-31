<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import * as Button from "$lib/components/ui/button";

	/** Props for the next-slide navigation button. */
	export type NextProps = WithoutChildren<Button.RootProps>;
</script>

<script lang="ts">
	import * as Carousel from ".";

	import { ChevronRightIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

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
		"absolute z-10 touch-manipulation rounded-full",
		emblaCtx.orientation === "horizontal" ? "inset-y-0 inset-e-2 my-auto" : "inset-x-0 bottom-2 mx-auto rotate-90",
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
