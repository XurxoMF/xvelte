<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { CountryCode } from "libphonenumber-js/min";
	import type { InputPhoneCountry, InputPhoneDetails } from "./input-phone-context.svelte";
	import type { WithElementRef } from "$lib/utils";

	/** Props for the composable Input Phone state provider. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		/** Bindable normalized E.164-compatible phone value. */
		value?: string | undefined;
		/** Bindable overall validation result. */
		valid?: boolean | undefined;
		/** Bindable selected ISO 3166-1 alpha-2 country code. */
		country?: CountryCode | null | undefined;
		/** Initial country used when `country` is not supplied. */
		defaultCountry?: CountryCode | null | undefined;
		/** Bindable parsed and formatted phone details. */
		details?: InputPhoneDetails | null | undefined;
		/** Countries shown by CountrySelector and accepted by validation. */
		allowedCountries?: CountryCode[] | undefined;
		/** Locale used to resolve and sort country names. */
		locale?: string | undefined;
		/** Optional final comparator for localized country metadata. */
		order?: ((a: InputPhoneCountry, b: InputPhoneCountry) => number) | undefined;
		/** Whether an empty phone value is invalid. */
		required?: boolean | undefined;
		/** Whether Input and CountrySelector are disabled. */
		disabled?: boolean | undefined;
		/** Whether Input is read-only; CountrySelector remains interactive. */
		readonly?: boolean | undefined;
	};
</script>

<script lang="ts">
	import { createInputPhoneCountries, InputPhoneState, setInputPhoneContext } from "./input-phone-context.svelte";

	import { getLocale } from "$lib/paraglide/runtime";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		valid = $bindable(true),
		defaultCountry = null,
		country = $bindable(defaultCountry),
		details = $bindable(null),
		allowedCountries,
		locale = getLocale(),
		order,
		required = false,
		disabled = false,
		readonly = false,
		class: className,
		children,
		...restProps
	}: RootProps = $props();

	const countries = $derived(createInputPhoneCountries(locale, allowedCountries, order));

	const state = new InputPhoneState({
		get value() {
			return value;
		},
		set value(nextValue) {
			value = nextValue;
		},
		get country() {
			return country ?? null;
		},
		set country(nextCountry) {
			country = nextCountry;
		},
		get valid() {
			return valid;
		},
		set valid(nextValid) {
			valid = nextValid;
		},
		get details() {
			return details;
		},
		set details(nextDetails) {
			details = nextDetails;
		},
		get countries() {
			return countries;
		},
		get required() {
			return required;
		},
		get disabled() {
			return disabled;
		},
		get readonly() {
			return readonly;
		}
	});

	setInputPhoneContext(state);

	$effect(() => state.syncValue(value));
	$effect(() => state.syncCountry(country ?? null));
	$effect(() => state.syncConfiguration(required, countries));
</script>

<div bind:this={ref} data-slot="input-phone" class={cn("contents", className)} {...restProps}>
	{@render children?.()}
</div>
