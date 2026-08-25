import type { RootProps } from "./carousel-root.svelte";
import type { ContentProps } from "./carousel-content.svelte";
import type { ItemProps } from "./carousel-item.svelte";
import type { PreviousProps } from "./carousel-previous.svelte";
import type { NextProps } from "./carousel-next.svelte";
import type { CarouselAPI, CarouselOptions, CarouselPlugins, CarouselProps, EmblaCarouselConfig, EmblaContext } from "./carousel-context";

import Root from "./carousel-root.svelte";
import Content from "./carousel-content.svelte";
import Item from "./carousel-item.svelte";
import Previous from "./carousel-previous.svelte";
import Next from "./carousel-next.svelte";
import { getEmblaContext, setEmblaContext } from "./carousel-context";

export {
	Root,
	Content,
	Item,
	Previous,
	Next,
	//
	type RootProps,
	type ContentProps,
	type ItemProps,
	type PreviousProps,
	type NextProps,
	//
	type CarouselAPI,
	type CarouselOptions,
	type CarouselPlugins,
	type CarouselProps,
	type EmblaCarouselConfig,
	type EmblaContext,
	//
	getEmblaContext,
	setEmblaContext
};
