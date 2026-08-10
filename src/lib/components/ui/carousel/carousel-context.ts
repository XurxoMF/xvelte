import type { EmblaCarouselSvelteType, default as emblaCarouselSvelte } from "embla-carousel-svelte";
import { createContext } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import type { WithElementRef } from "$lib/utils";

export type CarouselAPI =
	NonNullable<NonNullable<EmblaCarouselSvelteType["$$_attributes"]>["on:emblaInit"]> extends (evt: CustomEvent<infer CarouselAPI>) => void
		? CarouselAPI
		: never;

export type EmblaCarouselConfig = NonNullable<Parameters<typeof emblaCarouselSvelte>[1]>;

export type CarouselOptions = EmblaCarouselConfig["options"];
export type CarouselPlugins = EmblaCarouselConfig["plugins"];

export type CarouselProps = {
	opts?: CarouselOptions | undefined;
	plugins?: CarouselPlugins | undefined;
	setApi?: ((api: CarouselAPI | undefined) => void) | undefined;
	orientation?: "horizontal" | "vertical" | undefined;
} & WithElementRef<HTMLAttributes<HTMLDivElement>>;

export type EmblaContext = {
	api: CarouselAPI | undefined;
	orientation: "horizontal" | "vertical";
	scrollNext: () => void;
	scrollPrev: () => void;
	canScrollNext: boolean;
	canScrollPrev: boolean;
	handleKeyDown: (e: KeyboardEvent) => void;
	options: CarouselOptions;
	plugins: CarouselPlugins;
	onInit: (e: CustomEvent<CarouselAPI>) => void;
	scrollTo: (index: number, jump?: boolean | undefined) => void;
	scrollSnaps: number[];
	selectedIndex: number;
};

const [getEmblaState, setEmblaState] = createContext<EmblaContext>();

/**
 * Provides carousel state and controls to descendant parts.
 *
 * @param config - Reactive Embla state and navigation callbacks.
 * @returns The same context object for convenient local reuse.
 */
export function setEmblaContext(config: EmblaContext): EmblaContext {
	return setEmblaState(config);
}

/**
 * Retrieves the nearest carousel context and produces a helpful error outside a root.
 *
 * @param name - Consumer name included in the missing-context error.
 * @returns The nearest carousel context.
 */
export function getEmblaContext(name = "This component") {
	try {
		return getEmblaState();
	} catch {
		throw new Error(`${name} must be used within a <Carousel.Root> component`);
	}
}
