import type { ContentProps } from "./bubble-content.svelte";
import type { GroupProps } from "./bubble-group.svelte";
import type { ReactionsAlignments, ReactionsProps, ReactionsSides } from "./bubble-reactions.svelte";
import type { RootAlignments, RootProps, RootVariants } from "./bubble-root.svelte";

import Content from "./bubble-content.svelte";
import Group from "./bubble-group.svelte";
import Reactions, { reactionsVariants } from "./bubble-reactions.svelte";
import Root, { rootVariants } from "./bubble-root.svelte";

export {
	Root,
	Group,
	Content,
	Reactions,
	//
	type RootProps,
	type RootVariants,
	type RootAlignments,
	type GroupProps,
	type ContentProps,
	type ReactionsProps,
	type ReactionsSides,
	type ReactionsAlignments,
	//
	rootVariants,
	reactionsVariants
};
