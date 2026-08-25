import type { RootProps, RootSizes, RootVariants } from "./item-root.svelte";
import type { GroupProps } from "./item-group.svelte";
import type { SeparatorProps } from "./item-separator.svelte";
import type { HeaderProps } from "./item-header.svelte";
import type { FooterProps } from "./item-footer.svelte";
import type { ContentProps } from "./item-content.svelte";
import type { TitleProps } from "./item-title.svelte";
import type { DescriptionProps } from "./item-description.svelte";
import type { ActionsProps } from "./item-actions.svelte";
import type { MediaProps, MediaVariants } from "./item-media.svelte";

import Root, { rootVariants } from "./item-root.svelte";
import Group from "./item-group.svelte";
import Separator from "./item-separator.svelte";
import Header from "./item-header.svelte";
import Footer from "./item-footer.svelte";
import Content from "./item-content.svelte";
import Title from "./item-title.svelte";
import Description from "./item-description.svelte";
import Actions from "./item-actions.svelte";
import Media, { mediaVariants } from "./item-media.svelte";

export {
	Root,
	Group,
	Separator,
	Header,
	Footer,
	Content,
	Title,
	Description,
	Actions,
	Media,
	//
	type RootProps,
	type RootSizes,
	type RootVariants,
	type GroupProps,
	type SeparatorProps,
	type HeaderProps,
	type FooterProps,
	type ContentProps,
	type TitleProps,
	type DescriptionProps,
	type ActionsProps,
	type MediaProps,
	type MediaVariants,
	//
	rootVariants,
	mediaVariants
};
