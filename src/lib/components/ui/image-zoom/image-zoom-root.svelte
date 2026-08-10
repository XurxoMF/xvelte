<script lang="ts" module>
	import type { Snippet } from "svelte";
	export type RootProps = { class?: string; children?: Snippet };
</script>

<script lang="ts">
	import { writable } from "svelte/store";
	import { fade } from "svelte/transition";
	import * as Button from "$lib/components/ui/button";
	import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "$lib/icons";
	import { cn } from "$lib/utils";
	import { setImageZoomContext, type ZoomImageData } from "./image-zoom-context";

	let { class: className, children }: RootProps = $props();

	const registeredImagesStore = writable<ZoomImageData[]>([]);
	const currentImageIndexStore = writable<number | null>(null);
	const openStore = writable(false);

	let registeredImages = $state<ZoomImageData[]>([]);
	let currentImageIndex = $state<number | null>(null);
	let isOpen = $state(false);

	$effect(() => {
		registeredImages = $registeredImagesStore;
		currentImageIndex = $currentImageIndexStore;
		isOpen = $openStore;
	});

	const currentImageData = $derived(currentImageIndex !== null ? registeredImages[currentImageIndex] : null);
	const hasMultipleImages = $derived(registeredImages.length > 1);
	const hasPrevious = $derived(currentImageIndex !== null && currentImageIndex > 0);
	const hasNext = $derived(currentImageIndex !== null && currentImageIndex < registeredImages.length - 1);

	/** @param imageData - Image source and alternative text to append to the gallery. */
	function registerImage(imageData: Omit<ZoomImageData, "index">) {
		const index = $registeredImagesStore.length;
		$registeredImagesStore = [...$registeredImagesStore, { ...imageData, index }];
		return index;
	}

	/** @param index - Registered image index to display in the overlay. */
	function openImage(index: number) {
		$currentImageIndexStore = index;
		$openStore = true;
	}

	/** Displays the next registered image when available. */
	function nextImage() {
		if (currentImageIndex !== null && hasNext) {
			$currentImageIndexStore = currentImageIndex + 1;
		}
	}

	/** Displays the previous registered image when available. */
	function prevImage() {
		if (currentImageIndex !== null && hasPrevious) {
			$currentImageIndexStore = currentImageIndex - 1;
		}
	}

	/** Closes the overlay and clears its current image. */
	function closeZoom() {
		$openStore = false;
		$currentImageIndexStore = null;
	}

	setImageZoomContext({
		registeredImages: registeredImagesStore,
		currentImageIndex: currentImageIndexStore,
		open: openStore,
		registerImage,
		openImage,
		nextImage,
		prevImage
	});

	/** @param event - Window keyboard event used to close or navigate the open gallery. */
	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen) return;
		if (event.key === "Escape") closeZoom();
		if (event.key === "ArrowLeft") prevImage();
		if (event.key === "ArrowRight") nextImage();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && currentImageData}
	<div
		data-slot="image-zoom"
		class={cn("fixed inset-0 z-[10000] flex items-center justify-center bg-black/90", className)}
		transition:fade={{ duration: 150 }}
		aria-modal="true"
		role="dialog"
		tabindex="-1"
	>
		<button type="button" class="absolute inset-0" onclick={closeZoom} aria-label="Close"></button>

		<div class="pointer-events-none relative flex max-h-[90vh] max-w-[90vw] items-center justify-center">
			<img
				src={currentImageData.src}
				alt={currentImageData.alt}
				class="pointer-events-auto block max-h-full max-w-full object-contain"
				transition:fade={{ duration: 300, delay: 50 }}
			/>
		</div>

		{#if hasMultipleImages}
			<Button.Root
				variant="ghost"
				size="icon"
				class="pointer-events-auto absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer text-white hover:bg-primary hover:text-gray-300 disabled:pointer-events-none disabled:opacity-30"
				onclick={prevImage}
				disabled={!hasPrevious}
				aria-label="Previous image"
			>
				<ChevronLeftIcon class="h-8 w-8" />
			</Button.Root>

			<Button.Root
				variant="ghost"
				size="icon"
				class="pointer-events-auto absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-white hover:bg-primary hover:text-gray-300 disabled:pointer-events-none disabled:opacity-30"
				onclick={nextImage}
				disabled={!hasNext}
				aria-label="Next image"
			>
				<ChevronRightIcon class="h-8 w-8" />
			</Button.Root>
		{/if}

		<Button.Root
			variant="ghost"
			size="icon"
			class="pointer-events-auto absolute top-4 right-4 cursor-pointer text-white hover:bg-primary hover:text-gray-300"
			onclick={closeZoom}
			aria-label="Close zoomed image"
		>
			<CloseIcon class="h-6 w-6" />
		</Button.Root>
	</div>
{/if}

{@render children?.()}
