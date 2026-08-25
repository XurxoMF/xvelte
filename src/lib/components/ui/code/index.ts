import type { CopyButtonProps } from "./code-copy-button.svelte";
import type { CodeVariant, HighlightedRootProps, PlainTextRootProps, RootProps } from "./code-root.svelte";
import type { OverflowProps } from "./code-overflow.svelte";
import type { LanguageLoader, PlainTextLanguage } from "./shiki";

import CopyButton from "./code-copy-button.svelte";
import Root, { codeVariants } from "./code-root.svelte";
import Overflow from "./code-overflow.svelte";

export {
	Root,
	CopyButton,
	Overflow,
	//
	type RootProps,
	type PlainTextRootProps,
	type HighlightedRootProps,
	type CopyButtonProps,
	type OverflowProps,
	type LanguageLoader,
	type PlainTextLanguage,
	//
	type CodeVariant,
	//
	codeVariants
};
