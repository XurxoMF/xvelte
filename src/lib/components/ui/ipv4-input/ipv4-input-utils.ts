export type IPv4Segments = [string | null, string | null, string | null, string | null];

export function isNumber(value: unknown): boolean {
	if (typeof value === "number") return Number.isFinite(value);
	return typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));
}

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

export function isValidIPv4(value: string | null | undefined): boolean {
	if (!value) return false;
	const segments = value.replaceAll("_", ".").replaceAll(" ", ".").split(".");
	return segments.length === 4 && segments.every((segment) => isNumber(segment) && Number(segment) >= 0 && Number(segment) <= 255);
}
