import type { ContentProps } from "./marker-content.svelte";
import type { IconProps } from "./marker-icon.svelte";
import type { RootProps, RootVariants } from "./marker-root.svelte";

import Content from "./marker-content.svelte";
import Icon from "./marker-icon.svelte";
import Root, { rootVariants } from "./marker-root.svelte";

export {
	Root,
	Icon,
	Content,
	//
	type RootProps,
	type RootVariants,
	type IconProps,
	type ContentProps,
	//
	rootVariants
};
