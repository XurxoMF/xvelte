import type { RootProps } from "./empty-root.svelte";
import type { HeaderProps } from "./empty-header.svelte";
import type { MediaProps, MediaVariants } from "./empty-media.svelte";
import type { TitleProps } from "./empty-title.svelte";
import type { DescriptionProps } from "./empty-description.svelte";
import type { ContentProps } from "./empty-content.svelte";

import Root from "./empty-root.svelte";
import Header from "./empty-header.svelte";
import Media, { mediaVariants } from "./empty-media.svelte";
import Title from "./empty-title.svelte";
import Description from "./empty-description.svelte";
import Content from "./empty-content.svelte";

export {
	Root,
	Header,
	Media,
	Title,
	Description,
	Content,
	//
	type RootProps,
	type HeaderProps,
	type MediaProps,
	type MediaVariants,
	type TitleProps,
	type DescriptionProps,
	type ContentProps,
	//
	mediaVariants
};
