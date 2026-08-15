import Root, { type RootProps } from "./input-phone-root.svelte";
import Input, { type InputProps } from "./input-phone-input.svelte";
import CountrySelector, { type CountrySelectorProps } from "./input-phone-country-selector.svelte";
import type { InputPhoneCountry, InputPhoneDetails, InputPhoneValidationError } from "./input-phone-context.svelte";

export {
	Root,
	Input,
	CountrySelector,
	//
	type RootProps,
	type InputProps,
	type CountrySelectorProps,
	//
	type InputPhoneCountry,
	type InputPhoneDetails,
	type InputPhoneValidationError
};

export type { CountryCode } from "libphonenumber-js/min";
