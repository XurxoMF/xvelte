import type { HTMLInputAttributes } from "svelte/elements";

export type RootProps = Omit<HTMLInputAttributes, "children" | "class" | "value"> & {
	ref?: HTMLDivElement | null;
	inputRef?: HTMLInputElement | null;
	class?: string;
	value?: string[];
	validate?: (val: string, tags: string[]) => string | undefined;
	onValueChange?: (value: string[]) => void;
	suggestions?: string[];
	filterSuggestions?: (inputValue: string, suggestions: string[]) => string[];
	restrictToSuggestions?: boolean;
};
