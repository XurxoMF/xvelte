import { getContext, setContext } from "svelte";
import type { Writable } from "svelte/store";

const IMAGE_ZOOM_KEY = Symbol("image-zoom");

export type ZoomImageData = {
	src: string;
	alt: string;
	index: number;
};

type ImageZoomContext = {
	currentImageIndex: Writable<number | null>;
	open: Writable<boolean>;

	registerImage: (imageData: Omit<ZoomImageData, "index">) => number;
	openImage: (index: number) => void;

	nextImage: () => void;
	prevImage: () => void;

	registeredImages: Writable<ZoomImageData[]>;
};

/**
 * Provides the image registry and zoom controls to descendant triggers.
 *
 * @param ctx - Image registry, dialog state, and navigation callbacks.
 */
export function setImageZoomContext(ctx: ImageZoomContext) {
	setContext(IMAGE_ZOOM_KEY, ctx);
}

/**
 * Retrieves the nearest image-zoom context.
 *
 * @returns The context created by `ImageZoom.Root`.
 * @throws When called outside an image-zoom root.
 */
export function getImageZoomContext() {
	const ctx = getContext<ImageZoomContext>(IMAGE_ZOOM_KEY);
	if (!ctx) {
		throw new Error("ImageZoom.Trigger must be used inside an ImageZoom.Root");
	}
	return ctx;
}
