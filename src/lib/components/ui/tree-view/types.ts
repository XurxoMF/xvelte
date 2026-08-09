import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

import type { WithChildren, WithoutChildren } from "bits-ui";

import type { WithElementRef } from "$lib/utils";

export type TreeViewRootProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type TreeViewFolderProps = WithChildren<{
	name: string;
	open?: boolean;
	class?: string;
	icon?: Snippet<[{ name: string; open: boolean }]>;
}>;

export type TreeViewFilePropsWithoutHTML = WithChildren<{
	name: string;
	icon?: Snippet<[{ name: string }]>;
}>;

export type TreeViewFileProps = WithElementRef<WithoutChildren<HTMLButtonAttributes>, HTMLButtonElement> & TreeViewFilePropsWithoutHTML;
