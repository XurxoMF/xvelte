import type { RootProps } from "./input-phone-root.svelte";
import type { InputProps } from "./input-phone-input.svelte";
import type { CountrySelectorProps } from "./input-phone-country-selector.svelte";
import type { InputPhoneCountry, InputPhoneDetails, InputPhoneValidationError } from "./input-phone-context.svelte";

import Root from "./input-phone-root.svelte";
import Input from "./input-phone-input.svelte";
import CountrySelector from "./input-phone-country-selector.svelte";

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
