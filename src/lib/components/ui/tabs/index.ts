import type { RootProps } from "./tabs-root.svelte";
import type { ContentProps } from "./tabs-content.svelte";
import type { ListVariants, ListProps } from "./tabs-list.svelte";
import type { TriggerProps } from "./tabs-trigger.svelte";

import Root from "./tabs-root.svelte";
import Content from "./tabs-content.svelte";
import List, { listVariants } from "./tabs-list.svelte";
import Trigger from "./tabs-trigger.svelte";

export {
	Root,
	Content,
	List,
	Trigger,
	//
	type RootProps,
	type ContentProps,
	type ListVariants,
	type ListProps,
	type TriggerProps,
	//
	listVariants
};
