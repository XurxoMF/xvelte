/** Four normalized segments composing an IPv4 address. */
export type IPv4Segments = [string | null, string | null, string | null, string | null];

/**
 * Determines whether a value represents a finite number.
 *
 * @param value - Unknown value to inspect.
 */
export function isNumber(value: unknown): boolean {
	if (typeof value === "number") return Number.isFinite(value);
	return typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));
}

/**
 * Splits and normalizes a partial IPv4 string without throwing on invalid input.
 *
 * @param value - Address text using dots, spaces, or underscores as separators.
 * @returns Four normalized segments, or undefined when no value was provided.
 */
export function safeParseIPv4(value: string | undefined): IPv4Segments | undefined {
	if (value === undefined) return undefined;

	const segments = value.trim().replaceAll("_", ".").replaceAll(" ", ".").split(".").slice(0, 4) as (string | null)[];
	while (segments.length < 4) segments.push(null);

	for (let index = 0; index < segments.length; index++) {
		const segment = segments[index];
		if (segment === null || !isNumber(segment)) {
			segments[index] = null;
			continue;
		}

		const number = Number.parseInt(segment);
		segments[index] = number >= 0 && number <= 255 ? number.toString() : null;
	}

	return segments as IPv4Segments;
}

/**
 * Validates that a value contains exactly four numeric octets between 0 and 255.
 *
 * @param value - Address text to validate.
 */
export function isValidIPv4(value: string | null | undefined): boolean {
	if (!value) return false;
	const segments = value.replaceAll("_", ".").replaceAll(" ", ".").split(".");
	return segments.length === 4 && segments.every((segment) => isNumber(segment) && Number(segment) >= 0 && Number(segment) <= 255);
}
