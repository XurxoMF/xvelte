import { getContext, setContext, tick } from "svelte";

export type ComboboxType = "single" | "multiple";

export type ValueMap = {
	single: string;
	multiple: string[];
};

export const COMBOBOX_CONTEXT = Symbol("combobox");

/** Coordinates value selection, popup state, and focus for a combobox root. */
export class ComboboxState<T extends ComboboxType> {
	open = $state(false);
	triggerRef = $state<HTMLButtonElement | null>(null);
	type: T;

	#getValue: () => ValueMap[T];
	#setValue: (v: ValueMap[T]) => void;

	/**
	 * @param getValue - Reactive getter for the bound value.
	 * @param setValue - Callback that updates the bound value.
	 * @param type - Whether the combobox permits one or multiple values.
	 */
	constructor(getValue: () => ValueMap[T], setValue: (v: ValueMap[T]) => void, type: T) {
		this.#getValue = getValue;
		this.#setValue = setValue;
		this.type = type;
	}

	/** Current reactive single or multiple selection value. */
	get value(): ValueMap[T] {
		return this.#getValue();
	}

	/** Toggles the popup's open state. */
	toggle() {
		this.open = !this.open;
	}

	/** Closes the popup and restores focus to its trigger after the DOM updates. */
	async close() {
		this.open = false;
		await tick();
		this.triggerRef?.focus();
	}

	/** @param itemValue - Item value to test. */
	isSelected(itemValue: string): boolean {
		const v = this.#getValue();
		return Array.isArray(v) ? v.includes(itemValue) : v === itemValue;
	}

	/**
	 * Toggles an item in multiple mode or selects and closes in single mode.
	 *
	 * @param itemValue - Value of the selected item.
	 */
	selectItem(itemValue: string) {
		if (this.type === "multiple") {
			const current = (this.#getValue() as string[]) ?? [];
			const next = current.includes(itemValue) ? current.filter((v) => v !== itemValue) : [...current, itemValue];
			(this.#setValue as (v: string[]) => void)(next);
		} else {
			(this.#setValue as (v: string) => void)(this.isSelected(itemValue) ? "" : itemValue);
			this.close();
		}
	}
}

/**
 * Creates and provides combobox state for descendant parts.
 *
 * @param getValue - Reactive getter for the bound value.
 * @param setValue - Callback that updates the bound value.
 * @param type - Whether selection is single or multiple.
 */
export function createComboboxContext<T extends ComboboxType>(
	getValue: () => ValueMap[T],
	setValue: (v: ValueMap[T]) => void,
	type: T
): ComboboxState<T> {
	const ctx = new ComboboxState(getValue, setValue, type);
	setContext(COMBOBOX_CONTEXT, ctx);
	return ctx;
}

/** @returns The state from the nearest combobox root. */
export function getComboboxContext<T extends ComboboxType>(): ComboboxState<T> {
	return getContext(COMBOBOX_CONTEXT);
}
