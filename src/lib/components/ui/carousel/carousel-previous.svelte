<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import * as Button from "$lib/components/ui/button";

	/** Props for the previous-slide navigation button. */
	export type PreviousProps = WithoutChildren<Button.RootProps>;
</script>

<script lang="ts">
	import * as Carousel from ".";

	import { ChevronLeftIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "outline", size = "icon-sm", ...restProps }: PreviousProps = $props();

	const emblaCtx = Carousel.getEmblaContext("<Carousel.Previous/>");
</script>

<Button.Root
	data-slot="carousel-previous"
	{variant}
	{size}
	aria-disabled={!emblaCtx.canScrollPrev}
	disabled={!emblaCtx.canScrollPrev}
	class={cn(
		"absolute z-10 touch-manipulation rounded-full",
		emblaCtx.orientation === "horizontal" ? "inset-y-0 inset-s-2 my-auto" : "inset-x-0 top-2 mx-auto rotate-90",
		className
	)}
	onclick={emblaCtx.scrollPrev}
	onkeydown={emblaCtx.handleKeyDown}
	{...restProps}
	bind:ref
>
	<ChevronLeftIcon />
	<span class="sr-only">{m.bright_coral_back()}</span>
</Button.Root>
