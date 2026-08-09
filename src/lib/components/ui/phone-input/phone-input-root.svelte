<script lang="ts" module>
	import type { Country, CountryCode, DetailedValue, TelInputOptions } from "svelte-tel-input/types";

	export const defaultOptions: TelInputOptions = {
		spaces: true,
		autoPlaceholder: true
	};

	export type RootProps = {
		ref?: HTMLInputElement | null;
		country?: CountryCode | null;
		defaultCountry?: CountryCode | null;
		name?: string;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		class?: string;
		value?: string;
		valid?: boolean;
		detailedValue?: Partial<DetailedValue> | null;
		options?: TelInputOptions;
		order?: (a: Country, b: Country) => number;
	};
</script>

<script lang="ts">
	import "svelte-tel-input/styles/flags.css";
	import { TelInput, countries } from "svelte-tel-input";

	import { cn } from "$lib/utils";

	import CountrySelector from "./country-selector.svelte";

	let {
		class: className = undefined,
		defaultCountry = null,
		country = $bindable(defaultCountry),
		options = defaultOptions,
		placeholder,
		readonly = false,
		disabled = false,
		value = $bindable(""),
		valid = $bindable(true),
		detailedValue = $bindable(null),
		order = undefined,
		name = undefined,
		ref = $bindable(null),
		...rest
	}: RootProps = $props();
	let el = $state<HTMLInputElement>();

	$effect(() => {
		if (ref !== el) ref = el ?? null;
	});

	function focus() {
		setTimeout(() => {
			el?.focus();
		}, 0);
	}
</script>

<div data-slot="phone-input" class="flex place-items-center">
	<CountrySelector {order} {countries} {disabled} bind:selected={country} onselect={focus} />
	<TelInput
		data-slot="phone-input-control"
		{name}
		bind:country
		bind:detailedValue
		bind:value
		bind:valid
		{readonly}
		{disabled}
		{placeholder}
		bind:el
		{options}
		class={cn(
			"border-l-none flex h-9 w-full min-w-0 rounded-l-none rounded-r-md border-y border-r border-input bg-background px-3 py-1 text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
			"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
			"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
			className
		)}
		{...rest}
	/>
</div>
