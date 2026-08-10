import { hasFlag } from "country-flag-icons";
import type { Country, CountryCode } from "svelte-tel-input/types";

let flagIcons: Record<CountryCode, string> | null = null;

/**
 * Loads the SVG flag for a country, lazily importing the icon collection once.
 *
 * @param country - Selected phone country, or null when no country is selected.
 * @returns The country's SVG markup, or null when it has no supported flag.
 */
export async function getFlag(country: Country | null): Promise<string | null> {
	if (!country) return null;

	if (!hasFlag(country.iso2)) return null;

	flagIcons ??= await import("country-flag-icons/string/3x2");

	return flagIcons[country.iso2] ?? null;
}
