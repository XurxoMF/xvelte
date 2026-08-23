import { createContext } from "svelte";
import type { DateValue } from "@internationalized/date";

type DateStripContext = {
	readonly selectedValue: DateValue | undefined;
	readonly locale: string;
	onSelect: (date: DateValue) => void;
	isDateDisabled: (date: DateValue) => boolean;
	readonly direction: "start" | "end";
};

const [getDateStripState, setDateStripState] = createContext<DateStripContext>();

/**
 * Provides locale, selection, and navigation data to date-strip items.
 *
 * @param props - Reactive date-strip state and callbacks.
 */
export function setDateStripContext(props: DateStripContext) {
	return setDateStripState(props);
}

/** @returns The nearest date-strip context. */
export function getDateStripContext() {
	return getDateStripState();
}
