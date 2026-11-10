import type { ActionsProps } from "./code-block-actions.svelte";
import type { ContentProps } from "./code-block-content.svelte";
import type { CopyButtonProps } from "./code-block-copy-button.svelte";
import type { FooterProps } from "./code-block-footer.svelte";
import type { HeaderProps } from "./code-block-header.svelte";
import type { LineProps, LineToken, LineVariants } from "./code-block-line.svelte";
import type { RootProps, RootSizes, RootVariants } from "./code-block-root.svelte";
import type { TitleProps } from "./code-block-title.svelte";

import Actions from "./code-block-actions.svelte";
import Content from "./code-block-content.svelte";
import CopyButton from "./code-block-copy-button.svelte";
import Footer from "./code-block-footer.svelte";
import Header from "./code-block-header.svelte";
import Line, { lineVariants } from "./code-block-line.svelte";
import Root, { rootVariants } from "./code-block-root.svelte";
import Title from "./code-block-title.svelte";

export {
	Root,
	Header,
	Title,
	Actions,
	CopyButton,
	Content,
	Line,
	Footer,
	//
	type RootProps,
	type HeaderProps,
	type TitleProps,
	type ActionsProps,
	type CopyButtonProps,
	type ContentProps,
	type LineProps,
	type FooterProps,
	//
	type RootVariants,
	type RootSizes,
	type LineVariants,
	type LineToken,
	//
	rootVariants,
	lineVariants
};
