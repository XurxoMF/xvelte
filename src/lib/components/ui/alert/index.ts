import type { RootProps, RootVariants } from "./alert-root.svelte";
import type { DescriptionProps } from "./alert-description.svelte";
import type { TitleProps } from "./alert-title.svelte";
import type { ActionProps } from "./alert-action.svelte";

import Root, { rootVariants } from "./alert-root.svelte";
import Description from "./alert-description.svelte";
import Title from "./alert-title.svelte";
import Action from "./alert-action.svelte";

export {
	Root,
	Description,
	Title,
	Action,
	//
	type RootProps,
	type RootVariants,
	type DescriptionProps,
	type TitleProps,
	type ActionProps,
	//
	rootVariants
};
