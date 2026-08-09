import type { RootProps } from "./types";

export const defaultValidate: NonNullable<RootProps["validate"]> = (value, tags) => {
	const transformed = value.trim();
	return transformed.length > 0 && !tags.includes(transformed) ? transformed : undefined;
};

export const defaultFilter: NonNullable<RootProps["filterSuggestions"]> = (value, suggestions) => {
	const search = value.toLowerCase();
	return suggestions.filter((suggestion) => suggestion.toLowerCase().includes(search));
};
