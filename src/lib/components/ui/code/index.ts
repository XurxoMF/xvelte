import CopyButton, { type CopyButtonProps } from "./code-copy-button.svelte";
import Root, { codeVariants, type CodeVariant, type HighlightedRootProps, type PlainTextRootProps, type RootProps } from "./code-root.svelte";
import Overflow, { type OverflowProps } from "./code-overflow.svelte";
import type { LanguageLoader, PlainTextLanguage } from "./shiki";

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
