import type { BackReferenceProps } from "./footnote-back-reference.svelte";
import type { ItemProps } from "./footnote-item.svelte";
import type { ListProps } from "./footnote-list.svelte";
import type { ReferenceProps } from "./footnote-reference.svelte";
import type { RootProps } from "./footnote-root.svelte";

import BackReference from "./footnote-back-reference.svelte";
import Item from "./footnote-item.svelte";
import List from "./footnote-list.svelte";
import Reference from "./footnote-reference.svelte";
import Root from "./footnote-root.svelte";

export {
	Root,
	List,
	Item,
	Reference,
	BackReference,
	//
	type RootProps,
	type ListProps,
	type ItemProps,
	type ReferenceProps,
	type BackReferenceProps
};
