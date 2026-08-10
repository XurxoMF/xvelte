<script lang="ts" module>
	export type RootProps = WithElementRef<Carousel.CarouselProps>;
</script>

<script lang="ts">
	import { untrack } from "svelte";

	import { cn, type WithElementRef } from "$lib/utils";

	import * as Carousel from ".";

	let {
		ref = $bindable(null),
		opts = {},
		plugins = [],
		setApi = () => {},
		orientation = "horizontal",
		class: className,
		children,
		...restProps
	}: RootProps = $props();

	let carouselState = $state<Carousel.EmblaContext>({
		api: undefined,
		scrollPrev,
		scrollNext,
		orientation: untrack(() => orientation),
		canScrollNext: false,
		canScrollPrev: false,
		handleKeyDown,
		options: untrack(() => opts),
		plugins: untrack(() => plugins),
		onInit,
		scrollSnaps: [],
		selectedIndex: 0,
		scrollTo
	});

	Carousel.setEmblaContext(carouselState);

	/** Scrolls to the previous available snap. */
	function scrollPrev() {
		carouselState.api?.scrollPrev();
	}

	/** Scrolls to the next available snap. */
	function scrollNext() {
		carouselState.api?.scrollNext();
	}

	/**
	 * @param index - Zero-based snap index to select.
	 * @param jump - Whether to move immediately instead of animating.
	 */
	function scrollTo(index: number, jump?: boolean | undefined) {
		carouselState.api?.scrollTo(index, jump);
	}

	/** Synchronizes the selected index and navigation availability from Embla. */
	function onSelect() {
		if (!carouselState.api) return;
		carouselState.selectedIndex = carouselState.api.selectedScrollSnap();
		carouselState.canScrollNext = carouselState.api.canScrollNext();
		carouselState.canScrollPrev = carouselState.api.canScrollPrev();
	}

	/** @param e - Arrow-key event used for carousel navigation. */
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			scrollPrev();
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			scrollNext();
		}
	}

	/** @param event - Embla initialization event containing the carousel API. */
	function onInit(event: CustomEvent<Carousel.CarouselAPI>) {
		carouselState.api = event.detail;
		setApi(carouselState.api);

		carouselState.scrollSnaps = carouselState.api.scrollSnapList();
		carouselState.api.on("select", onSelect);
		onSelect();
	}

	$effect(() => {
		return () => {
			carouselState.api?.off("select", onSelect);
		};
	});
</script>

<div bind:this={ref} data-slot="carousel" class={cn("relative", className)} role="region" aria-roledescription="carousel" {...restProps}>
	{@render children?.()}
</div>
