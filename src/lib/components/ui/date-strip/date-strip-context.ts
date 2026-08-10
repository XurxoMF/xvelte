import { getContext, setContext } from "svelte";
import type { DateValue } from "@internationalized/date";

const DATESTRIP_KEY = Symbol("datestrip");

type DateStripContext = {
	selectedValue: () => DateValue | undefined;
	onSelect: (date: DateValue) => void;
	isDateDisabled: (date: DateValue) => boolean;
	direction: () => "start" | "end";
};

/**
 * Provides selection and navigation data to date-strip items.
 *
 * @param props - Reactive date-strip state and callbacks.
 */
export function setDateStripContext(props: DateStripContext) {
	setContext(DATESTRIP_KEY, props);
}

/** @returns The nearest date-strip context. */
export function getDateStripContext() {
	return getContext<DateStripContext>(DATESTRIP_KEY);
}
