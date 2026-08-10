<script lang="ts" module>
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
</script>

<script lang="ts">
	import { watch } from "runed";

	import { cn } from "$lib/utils";

	import * as TagsInput from ".";
	import { handleKeydown } from "./tags-input-keyboard";

	const defaultValidate: NonNullable<RootProps["validate"]> = (value, tags) => {
		const transformed = value.trim();
		return transformed.length > 0 && !tags.includes(transformed) ? transformed : undefined;
	};

	const defaultFilter: NonNullable<RootProps["filterSuggestions"]> = (value, suggestions) => {
		const search = value.toLowerCase();
		return suggestions.filter((suggestion) => suggestion.toLowerCase().includes(search));
	};

	let {
		value = $bindable([]),
		placeholder,
		class: className,
		disabled = false,
		validate = defaultValidate,
		onValueChange,
		suggestions,
		filterSuggestions = defaultFilter,
		restrictToSuggestions = false,
		ref = $bindable(null),
		inputRef = $bindable(null),
		...rest
	}: RootProps = $props();

	let inputValue = $state("");
	let tagIndex = $state<number>();
	let invalid = $state(false);
	let isComposing = $state(false);
	let inputFocused = $state(false);
	let listboxId = $props.id();
	let listboxEl = $state<HTMLElement>();

	$effect(() => {
		if (suggestionIndex !== undefined && listboxEl) {
			const item = listboxEl.querySelector(`#${CSS.escape(listboxId)}-${suggestionIndex}`);
			item?.scrollIntoView({ block: "nearest" });
		}
	});

	const filteredSuggestions = $derived.by(() => {
		if (!suggestions) return [];

		const available = suggestions.filter((s) => !value.includes(s));

		if (inputValue.length === 0) return available;

		return filterSuggestions(inputValue, available);
	});
	let suggestionIndex = $derived<number | undefined>(filteredSuggestions.length > 0 ? 0 : undefined);

	const showSuggestions = $derived(inputFocused && filteredSuggestions.length > 0 && tagIndex === undefined);

	watch(
		() => inputValue,
		() => {
			invalid = false;
		}
	);

	const selectSuggestion = (val: string) => {
		const validated = validate(val, value);

		if (!validated) return;

		value = [...value, validated];
		onValueChange?.(value);
		inputValue = "";
		suggestionIndex = undefined;
	};

	const enter = () => {
		if (isComposing) return;

		if (showSuggestions && suggestionIndex !== undefined) {
			selectSuggestion(filteredSuggestions[suggestionIndex]);
			return;
		}

		if (restrictToSuggestions && suggestions) {
			const match = suggestions.find((s) => s.toLowerCase() === inputValue.trim().toLowerCase());

			if (!match) {
				invalid = true;
				return;
			}

			selectSuggestion(match);
			return;
		}

		const validated = validate(inputValue, value);

		if (!validated) {
			invalid = true;
			return;
		}

		value = [...value, validated];
		onValueChange?.(value);
		inputValue = "";
	};

	const compositionStart = () => {
		isComposing = true;
	};

	const compositionEnd = () => {
		isComposing = false;
	};

	function keydown(event: KeyboardEvent) {
		handleKeydown(event, {
			inputValue,
			values: value,
			tagIndex,
			suggestionIndex,
			suggestions: filteredSuggestions,
			showSuggestions,
			isComposing,
			setTagIndex: (index) => (tagIndex = index),
			setSuggestionIndex: (index) => (suggestionIndex = index),
			selectSuggestion,
			deleteIndex,
			enter
		});
	}
	const deleteValue = (val: string) => {
		const index = value.findIndex((v) => val === v);

		if (index === -1) return;

		deleteIndex(index);
	};

	const deleteIndex = (index: number) => {
		value = [...value.slice(0, index), ...value.slice(index + 1)];
		onValueChange?.(value);
	};

	const blur = () => {
		tagIndex = undefined;
		setTimeout(() => {
			inputFocused = false;
		}, 150);
	};

	const focus = () => {
		inputFocused = true;
	};
</script>

<div
	bind:this={ref}
	data-slot="tags-input"
	class={cn(
		"relative flex min-h-[36px] w-full flex-wrap place-items-center gap-1 rounded-md border border-input bg-background py-0.5 pr-1 pl-1 selection:bg-primary disabled:opacity-50 aria-disabled:cursor-not-allowed dark:bg-input/30",
		className
	)}
	aria-disabled={disabled}
>
	{#each value as tag, i (tag)}
		<TagsInput.Tag value={tag} {disabled} onDelete={deleteValue} active={i === tagIndex} />
	{/each}
	<input
		bind:this={inputRef}
		data-slot="tags-input-control"
		{...rest}
		bind:value={inputValue}
		onblur={blur}
		onfocus={focus}
		oncompositionstart={compositionStart}
		oncompositionend={compositionEnd}
		{disabled}
		{placeholder}
		data-invalid={invalid}
		onkeydown={keydown}
		role={suggestions ? "combobox" : undefined}
		aria-expanded={suggestions ? showSuggestions : undefined}
		aria-autocomplete={suggestions ? "list" : undefined}
		aria-controls={suggestions ? listboxId : undefined}
		aria-activedescendant={suggestionIndex !== undefined ? `${listboxId}-${suggestionIndex}` : undefined}
		class="min-w-16 shrink grow basis-0 border-none bg-transparent px-2 outline-hidden placeholder:text-muted-foreground focus:outline-hidden disabled:cursor-not-allowed data-[invalid=true]:text-destructive md:text-sm"
	/>
	{#if showSuggestions}
		<div
			bind:this={listboxEl}
			data-slot="tags-input-suggestions"
			id={listboxId}
			role="listbox"
			class="absolute top-full right-0 left-0 z-50 mt-1 max-h-50 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
		>
			{#each filteredSuggestions as suggestion, i (suggestion)}
				<TagsInput.Suggestion id="{listboxId}-{i}" value={suggestion} active={i === suggestionIndex} onSelect={selectSuggestion} />
			{/each}
		</div>
	{/if}
</div>
