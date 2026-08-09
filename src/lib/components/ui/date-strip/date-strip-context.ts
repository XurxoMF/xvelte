import { getContext, setContext } from "svelte";
import type { DateValue } from "@internationalized/date";

const DATESTRIP_KEY = Symbol("datestrip");

type DateStripContext = {
	selectedValue: () => DateValue | undefined;
	onSelect: (date: DateValue) => void;
	isDateDisabled: (date: DateValue) => boolean;
	direction: () => "start" | "end";
};

export function setDateStripContext(props: DateStripContext) {
	setContext(DATESTRIP_KEY, props);
}

export function getDateStripContext() {
	return getContext<DateStripContext>(DATESTRIP_KEY);
}
