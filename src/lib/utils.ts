import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SvelteSet } from "svelte/reactivity";

import type { ClassValue } from "clsx";

/**
 * Merges class values and resolves conflicting Tailwind utilities in favor of the last value.
 *
 * @param inputs - Conditional, nested, or plain class values to merge.
 * @returns The normalized class string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any | undefined } ? Omit<T, "child"> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any | undefined } ? Omit<T, "children"> : T;

export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null | undefined;
};

/**
 * Resolves after the requested delay.
 *
 * @param ms - Delay in milliseconds.
 * @returns A promise that resolves once the delay has elapsed.
 */
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Tests whether at least one value in a native or reactive set satisfies a predicate.
 *
 * @param set - Set whose values should be tested.
 * @param fn - Predicate called for each value until one returns true.
 * @returns Whether any value satisfied the predicate.
 */
export function someInSet<T>(set: Set<T> | SvelteSet<T>, fn: (item: T) => boolean) {
	for (const item of set) if (fn(item)) return true;
	return false;
}

/**
 * Pads one side of a string until it reaches a requested length.
 *
 * @param str - String to pad.
 * @param length - Minimum total length of the result.
 * @param options - Padding character and side.
 * @returns The padded string.
 */
export function padSides(
	str: string,
	length: number,
	options: { padChar: string; position: "left" | "right" } = { padChar: " ", position: "right" }
): string {
	if (options.position === "right") {
		return str + options.padChar.repeat(Math.max(0, length - str.length));
	} else {
		return options.padChar.repeat(Math.max(0, length - str.length)) + str;
	}
}

/**
 * Inserts padding between two strings until their combined result reaches a requested length.
 *
 * @param strLeft - Content placed before the padding.
 * @param strRight - Content placed after the padding.
 * @param length - Minimum total length of the result.
 * @param options - Character used for padding.
 * @returns The padded string.
 */
export function padCenter(strLeft: string, strRight: string, length: number, options: { padChar: string } = { padChar: " " }): string {
	return strLeft + options.padChar.repeat(Math.max(0, length - (strLeft.length + strRight.length))) + strRight;
}

/**
 * Replaces path-reserved characters and whitespace with normalized hyphens.
 *
 * @param str - String to make safe for use as a path segment.
 * @returns The normalized string without leading or trailing hyphens.
 */
export function cleanForPath(str: string): string {
	return str
		.replace(/[<>:"/\\|?*]/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Converts milliseconds to a formatted duration in the requested unit.
 *
 * @param ms - Duration in milliseconds.
 * @param options - Output unit and number of decimal places.
 * @returns Numeric duration formatted as a string.
 */
export function formatTime(
	ms: number,
	options: {
		to?: "seconds" | "minutes" | "hours" | "days" | undefined;
		decimals?: number | undefined;
	} = { to: "seconds", decimals: 0 }
): string {
	const seconds = ms / 1000;
	const minutes = seconds / 60;
	const hours = minutes / 60;
	const days = hours / 24;

	switch (options.to) {
		case "seconds":
			return `${seconds.toFixed(options.decimals)}`;
		case "minutes":
			return `${minutes.toFixed(options.decimals)}`;
		case "hours":
			return `${hours.toFixed(options.decimals)}`;
		case "days":
			return `${days.toFixed(options.decimals)}`;
		default:
			return `${seconds.toFixed(options.decimals)}`;
	}
}
