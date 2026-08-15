import { createContext } from "svelte";
import { hasFlag } from "country-flag-icons";
import {
	AsYouType,
	getCountries,
	getCountryCallingCode,
	parsePhoneNumberFromString,
	validatePhoneNumberLength,
	type CountryCode,
	type ValidatePhoneNumberLengthResult
} from "libphonenumber-js/min";

/** Country metadata rendered by the Input Phone country selector. */
export type InputPhoneCountry = {
	code: CountryCode;
	name: string;
	callingCode: string;
	searchValue: string;
};

/** Validation errors owned by Input Phone in addition to libphonenumber-js length errors. */
export type InputPhoneValidationError = ValidatePhoneNumberLengthResult | "COUNTRY_NOT_ALLOWED" | "INVALID" | "REQUIRED";

/** Parsed state exposed by the Root details binding. */
export type InputPhoneDetails = {
	raw: string;
	e164: string | null;
	country: CountryCode | null;
	callingCode: string | null;
	nationalNumber: string | null;
	formatNational: string | null;
	formatInternational: string | null;
	uri: string | null;
	possible: boolean;
	valid: boolean;
	error: InputPhoneValidationError | null;
};

type InputPhoneStateOptions = {
	get value(): string;
	set value(value: string);
	get country(): CountryCode | null;
	set country(country: CountryCode | null);
	get valid(): boolean;
	set valid(valid: boolean);
	get details(): InputPhoneDetails | null;
	set details(details: InputPhoneDetails | null);
	get countries(): InputPhoneCountry[];
	get required(): boolean;
	get disabled(): boolean;
	get readonly(): boolean;
};

/**
 * Builds localized, searchable country metadata from libphonenumber-js.
 *
 * @param locale - Locale used to resolve region names.
 * @param allowedCountries - Optional country subset; all supported countries are used when omitted.
 * @param order - Optional final country comparator.
 * @returns Country metadata ready for the public selector.
 */
export function createInputPhoneCountries(
	locale: string,
	allowedCountries?: CountryCode[] | undefined,
	order?: ((a: InputPhoneCountry, b: InputPhoneCountry) => number) | undefined
): InputPhoneCountry[] {
	const displayNames = new Intl.DisplayNames([locale], { type: "region" });
	const supportedCountries = getCountries();

	const countries = supportedCountries
		.filter((code) => allowedCountries?.includes(code) ?? true)
		.map((code) => {
			const name = displayNames.of(code) ?? code;
			const callingCode = getCountryCallingCode(code);

			return {
				code,
				name,
				callingCode,
				searchValue: name + " " + code + " +" + callingCode
			};
		});

	return countries.sort(order ?? ((a, b) => a.name.localeCompare(b.name, locale)));
}

/** Reactive state shared by an Input Phone Root and its public descendants. */
export class InputPhoneState {
	static #flagIcons: Record<CountryCode, string> | null = null;

	#options: InputPhoneStateOptions;
	#inputValue = $state("");
	#inputRef = $state<HTMLInputElement | null>(null);
	#committedValue: string | null = null;
	#syncedCountry: CountryCode | null = null;
	#configurationSignature = "";

	/**
	 * Creates the shared phone state.
	 *
	 * @param options - Reactive Root bindings and configuration.
	 */
	constructor(options: InputPhoneStateOptions) {
		this.#options = options;
		this.#syncedCountry = options.country;
		this.syncValue(options.value);
		this.syncConfiguration(options.required, options.countries);
	}

	/** Current text shown by the telephone input. */
	get inputValue() {
		return this.#inputValue;
	}

	/** Underlying telephone input, used to restore focus after country selection. */
	get inputRef() {
		return this.#inputRef;
	}

	set inputRef(ref: HTMLInputElement | null) {
		this.#inputRef = ref;
	}

	/** Normalized E.164-compatible Root value. */
	get value() {
		return this.#options.value;
	}

	/** Selected country code. */
	get country() {
		return this.#options.country;
	}

	/** Current overall validity. */
	get valid() {
		return this.#options.valid;
	}

	/** Current parsed phone details. */
	get details() {
		return this.#options.details;
	}

	/** Countries available in the selector and validation state. */
	get countries() {
		return this.#options.countries;
	}

	/** Whether empty input is invalid. */
	get required() {
		return this.#options.required;
	}

	/** Whether both public controls are disabled. */
	get disabled() {
		return this.#options.disabled;
	}

	/** Whether only the telephone text input is read-only. */
	get readonly() {
		return this.#options.readonly;
	}

	/**
	 * Loads the SVG flag for a country, lazily importing the shared icon collection once.
	 *
	 * @param country - Selected phone country code, or null when no country is selected.
	 * @returns The country's SVG markup, or null when it has no supported flag.
	 */
	async getFlag(country: CountryCode | null): Promise<string | null> {
		if (!country || !hasFlag(country)) return null;

		InputPhoneState.#flagIcons ??= await import("country-flag-icons/string/3x2");

		return InputPhoneState.#flagIcons[country] ?? null;
	}

	/**
	 * Synchronizes a value assigned through the Root binding.
	 *
	 * @param value - New external phone value.
	 */
	syncValue(value: string) {
		if (value === this.#committedValue) return;

		this.#committedValue = value;

		if (!value.trim()) {
			this.#inputValue = "";
			this.#analyze("");
			return;
		}

		const parsed = parsePhoneNumberFromString(value, this.country ?? undefined);
		if (!parsed) {
			this.#inputValue = value;
			this.#analyze(value);
			return;
		}

		if (parsed.country && this.#isAllowed(parsed.country)) {
			this.#options.country = parsed.country;
			this.#syncedCountry = parsed.country;
		}

		this.#inputValue = value.startsWith("+") ? parsed.formatInternational() : parsed.formatNational();
		this.#analyze(this.#inputValue);
	}

	/**
	 * Reinterprets the current input after the Root country binding changes.
	 *
	 * @param country - New external country.
	 */
	syncCountry(country: CountryCode | null) {
		if (country === this.#syncedCountry) return;

		this.#syncedCountry = country;
		this.#reparseForCountry();
	}

	/**
	 * Revalidates the current value after Root validation or country-list configuration changes.
	 *
	 * @param required - Whether an empty input is invalid.
	 * @param countries - Countries currently accepted by the Root.
	 */
	syncConfiguration(required: boolean, countries: InputPhoneCountry[]) {
		const signature = (required ? "required:" : "optional:") + countries.map((item) => item.code).join(",");
		if (signature === this.#configurationSignature) return;

		this.#configurationSignature = signature;
		if (this.country && !this.#isAllowed(this.country)) {
			this.#options.country = null;
			this.#syncedCountry = null;
		}
		this.#analyze(this.#inputValue);
	}

	/**
	 * Processes text entered into the public Input.
	 *
	 * @param value - Current visible input value.
	 */
	updateInput(value: string) {
		this.#inputValue = value;
		this.#analyze(value);
	}

	/** Formats the current visible value after editing finishes. */
	formatInput() {
		const parsed = parsePhoneNumberFromString(this.#inputValue, this.country ?? undefined);
		if (!parsed) return;

		this.#inputValue = this.#inputValue.trim().startsWith("+") ? parsed.formatInternational() : parsed.formatNational();
		this.#analyze(this.#inputValue);
	}

	/**
	 * Selects a country and reinterprets the current national number.
	 *
	 * @param country - Country selected through the public CountrySelector.
	 */
	selectCountry(country: CountryCode) {
		if (!this.#isAllowed(country)) return;

		this.#options.country = country;
		this.#syncedCountry = country;
		this.#reparseForCountry();

		setTimeout(() => this.#inputRef?.focus(), 0);
	}

	#reparseForCountry() {
		const nationalNumber = this.details?.nationalNumber ?? this.#inputValue;
		this.#inputValue = nationalNumber;
		this.#analyze(nationalNumber);
		this.formatInput();
	}

	#analyze(raw: string) {
		const trimmed = raw.trim();

		if (!trimmed) {
			this.#commit("", !this.required, null);
			return;
		}

		const formatter = new AsYouType(this.country ?? undefined);
		formatter.input(trimmed);

		const parsed = formatter.getNumber();
		const detectedCountry = formatter.getCountry() ?? parsed?.country;
		const countryAllowed = detectedCountry ? this.#isAllowed(detectedCountry) : true;

		if (detectedCountry && countryAllowed && detectedCountry !== this.country) {
			this.#options.country = detectedCountry;
			this.#syncedCountry = detectedCountry;
		}

		const e164 = formatter.getNumberValue()?.toString() ?? "";
		const possible = formatter.isPossible();
		const valid = formatter.isValid() && countryAllowed;
		const error = this.#getValidationError(trimmed, countryAllowed, valid);

		const details: InputPhoneDetails = {
			raw,
			e164: e164 || null,
			country: detectedCountry ?? this.country,
			callingCode: parsed?.countryCallingCode ?? (this.country ? getCountryCallingCode(this.country) : null),
			nationalNumber: parsed?.nationalNumber ?? null,
			formatNational: parsed?.formatNational() ?? null,
			formatInternational: parsed?.formatInternational() ?? null,
			uri: parsed?.getURI() ?? null,
			possible,
			valid,
			error
		};

		this.#commit(e164, valid, details);
	}

	#getValidationError(raw: string, countryAllowed: boolean, valid: boolean): InputPhoneValidationError | null {
		if (!raw.trim()) return this.required ? "REQUIRED" : null;
		if (!countryAllowed) return "COUNTRY_NOT_ALLOWED";
		if (valid) return null;

		return validatePhoneNumberLength(raw, this.country ?? undefined) ?? "INVALID";
	}

	#commit(value: string, valid: boolean, details: InputPhoneDetails | null) {
		this.#committedValue = value;
		this.#options.value = value;
		this.#options.valid = valid;
		this.#options.details = details;
	}

	#isAllowed(country: CountryCode) {
		return this.countries.some((item) => item.code === country);
	}
}

const [getInputPhoneContext, setInputPhoneContext] = createContext<InputPhoneState>();

export { getInputPhoneContext, setInputPhoneContext };
