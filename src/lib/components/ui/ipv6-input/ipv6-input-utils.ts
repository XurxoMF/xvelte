/** Eight normalized hexadecimal segments composing an IPv6 address. */
export type IPv6Segments = [string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null];

/**
 * Determines whether a value is a single hexadecimal character.
 *
 * @param value - Character to inspect.
 * @returns Whether the character is a hexadecimal digit.
 */
export function isHexDigit(value: string): boolean {
	return /^[0-9a-f]$/i.test(value);
}

/**
 * Normalizes alternative separators accepted by the component.
 *
 * @param value - Address text using colons, spaces, or underscores as separators.
 * @returns Address text using colons exclusively.
 */
function normalizeSeparators(value: string): string {
	return value.trim().replaceAll("_", ":").replaceAll(" ", ":");
}

/**
 * Converts a dotted IPv4 tail into the final two IPv6 hextets.
 *
 * @param value - Dotted decimal IPv4 address.
 * @returns Two hexadecimal segments, or undefined when the tail is invalid.
 */
function parseIPv4Tail(value: string): [string, string] | undefined {
	const octets = value.split(".");
	if (octets.length !== 4 || octets.some((octet) => !/^\d{1,3}$/.test(octet) || Number(octet) > 255)) return undefined;

	const numbers = octets.map(Number);
	return [((numbers[0] << 8) | numbers[1]).toString(16), ((numbers[2] << 8) | numbers[3]).toString(16)];
}

/**
 * Parses a complete IPv6 address and expands its compressed zero run.
 *
 * @param value - Normalized IPv6 text.
 * @returns Eight lowercase hextets, or undefined when the address is incomplete or invalid.
 */
function parseCompleteIPv6(value: string): string[] | undefined {
	if (value === "") return undefined;

	let normalized = value;
	if (normalized.includes(".")) {
		const lastSeparator = normalized.lastIndexOf(":");
		if (lastSeparator === -1) return undefined;

		const ipv4Tail = parseIPv4Tail(normalized.slice(lastSeparator + 1));
		if (!ipv4Tail) return undefined;

		normalized = `${normalized.slice(0, lastSeparator)}:${ipv4Tail.join(":")}`;
	}

	const compressionIndex = normalized.indexOf("::");
	if (compressionIndex !== -1) {
		if (compressionIndex !== normalized.lastIndexOf("::")) return undefined;

		const [leftText, rightText] = normalized.split("::");
		const left = leftText === "" ? [] : leftText.split(":");
		const right = rightText === "" ? [] : rightText.split(":");
		const missingSegments = 8 - left.length - right.length;

		if (missingSegments < 1 || [...left, ...right].some((segment) => !/^[0-9a-f]{1,4}$/i.test(segment))) return undefined;

		return [...left, ...Array<string>(missingSegments).fill("0"), ...right].map((segment) => segment.toLowerCase());
	}

	const segments = normalized.split(":");
	if (segments.length !== 8 || segments.some((segment) => !/^[0-9a-f]{1,4}$/i.test(segment))) return undefined;

	return segments.map((segment) => segment.toLowerCase());
}

/**
 * Splits and normalizes a partial or complete IPv6 string without throwing on invalid input.
 *
 * Complete compressed addresses and IPv4-mapped tails are expanded to eight hextets. Partial
 * values retain their segment positions so they can be edited by the component.
 *
 * @param value - Address text using colons, spaces, or underscores as separators.
 * @returns Eight normalized segments, or undefined when no value was provided.
 */
export function safeParseIPv6(value: string | undefined): IPv6Segments | undefined {
	if (value === undefined) return undefined;

	const normalized = normalizeSeparators(value);
	const complete = parseCompleteIPv6(normalized);
	if (complete) return complete as IPv6Segments;

	const segments = normalized.split(":").slice(0, 8) as (string | null)[];
	while (segments.length < 8) segments.push(null);

	for (let index = 0; index < segments.length; index++) {
		const segment = segments[index];
		segments[index] = segment !== null && /^[0-9a-f]{1,4}$/i.test(segment) ? segment.toLowerCase() : null;
	}

	return segments as IPv6Segments;
}

/**
 * Validates complete expanded, compressed, and IPv4-mapped IPv6 addresses.
 *
 * @param value - Address text to validate.
 * @returns Whether the value represents a complete IPv6 address.
 */
export function isValidIPv6(value: string | null | undefined): boolean {
	return value !== null && value !== undefined && parseCompleteIPv6(normalizeSeparators(value)) !== undefined;
}
