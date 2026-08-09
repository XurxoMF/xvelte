import type { HTMLAttributes } from "svelte/elements";

import type { WithChildren, WithoutChildren } from "bits-ui";

import type { CodeVariant } from "./code-variants";
import type { SupportedLanguage } from "./shiki";

export type CodeRootPropsWithoutHTML = WithChildren<{
	ref?: HTMLDivElement | null;
	variant?: CodeVariant;
	lang?: SupportedLanguage;
	code: string;
	class?: string;
	hideLines?: boolean;
	highlight?: (number | [number, number])[];
}>;

export type CodeRootProps = CodeRootPropsWithoutHTML & WithoutChildren<HTMLAttributes<HTMLDivElement>>;

export type CodeOverflowPropsWithoutHTML = WithChildren<{
	collapsed?: boolean;
}>;

export type CodeOverflowProps = CodeOverflowPropsWithoutHTML & WithoutChildren<HTMLAttributes<HTMLDivElement>>;
