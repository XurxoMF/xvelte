import { createContext, tick } from "svelte";

/** Supported combobox selection modes. */
export type ComboboxType = "single" | "multiple";

/** Maps each selection mode to its value shape. */
export type ValueMap = {
	/** Value used by a single-selection combobox. */
	single: string;
	/** Values used by a multiple-selection combobox. */
	multiple: string[];
};

/** Reactive root options used to create combobox context state. */
export type ComboboxOptions<T extends ComboboxType> = {
	/** Current single or multiple selection. */
	value: ValueMap[T];
	/** Current popup visibility. */
	open: boolean;
	/** Selection mode configured when the context is created. */
	readonly type: T;
	/** Whether all trigger, search, and selection interaction is disabled. */
	readonly disabled: boolean;
	/** Whether selecting the current single value clears it. */
	readonly allowDeselect: boolean;
	/** Whether selecting an item closes the popup. */
	readonly closeOnSelect: boolean;
	/** Called after popup visibility changes through the shared state. */
	readonly onOpenChange?: ((open: boolean) => void) | undefined;
};

/** Coordinates value selection, popup state, and focus for a combobox root. */
export class ComboboxState<T extends ComboboxType> {
	/** Trigger element used for focus restoration. */
	triggerRef = $state<HTMLElement | null>(null);
	/**
	 * @param options - Reactive value and selection mode owned by the root.
	 */
	constructor(private readonly options: ComboboxOptions<T>) {}

	/** Current reactive single or multiple selection value. */
	get value(): ValueMap[T] {
		return this.options.value;
	}

	/** Updates the current single or multiple selection value. */
	set value(value: ValueMap[T]) {
		this.options.value = value;
	}

	/** Current reactive popup visibility. */
	get open(): boolean {
		return this.options.open;
	}

	/** Updates popup visibility and reports the change. */
	set open(open: boolean) {
		if (open === this.options.open) return;
		this.options.open = open;
		this.options.onOpenChange?.(open);
	}

	/** Whether the combobox permits one or multiple values. */
	get type(): T {
		return this.options.type;
	}

	/** Whether all interaction is disabled by the root. */
	get disabled(): boolean {
		return this.options.disabled;
	}

	/** Whether the selected single value may be cleared by selecting it again. */
	get allowDeselect(): boolean {
		return this.options.allowDeselect;
	}

	/** Whether item selection closes the popup. */
	get closeOnSelect(): boolean {
		return this.options.closeOnSelect;
	}

	/** Opens the popup unless the root is disabled. */
	openPopup() {
		if (!this.disabled) this.open = true;
	}

	/** Toggles the popup's open state. */
	toggle() {
		if (!this.disabled) this.open = !this.open;
	}

	/**
	 * Closes the popup and restores focus to its trigger after the DOM updates.
	 *
	 * @returns A promise that resolves after focus restoration.
	 */
	async close() {
		this.open = false;
		await tick();
		this.triggerRef?.focus();
	}

	/** Clears the current selection when the configured mode permits it. */
	clear() {
		if (this.disabled || (this.type === "single" && !this.allowDeselect)) return;
		this.value = (this.type === "multiple" ? [] : "") as ValueMap[T];
	}

	/** @param itemValue - Item value to test. */
	isSelected(itemValue: string): boolean {
		const v = this.value;
		return Array.isArray(v) ? v.includes(itemValue) : v === itemValue;
	}

	/**
	 * Toggles an item in multiple mode or selects and closes in single mode.
	 *
	 * @param itemValue - Value of the selected item.
	 */
	selectItem(itemValue: string) {
		if (this.disabled) return;

		if (this.type === "multiple") {
			const current = (this.value as string[]) ?? [];
			const next = current.includes(itemValue) ? current.filter((v) => v !== itemValue) : [...current, itemValue];
			this.value = next as ValueMap[T];
		} else {
			if (!this.isSelected(itemValue)) this.value = itemValue as ValueMap[T];
			else if (this.allowDeselect) this.value = "" as ValueMap[T];
		}

		if (this.closeOnSelect) void this.close();
	}
}

/** Type-erased state shared by single and multiple combobox descendants. */
export type ComboboxContextState = {
	/** Whether the options popup is open. */
	open: boolean;
	/** Trigger used to restore focus after closing. */
	triggerRef: HTMLElement | null;
	/** Selection mode configured by the root. */
	type: ComboboxType;
	/** Whether all interaction is disabled by the root. */
	disabled: boolean;
	/** Whether the selected single value may be cleared. */
	allowDeselect: boolean;
	/** Whether selecting an item closes the popup. */
	closeOnSelect: boolean;
	/** Current single or multiple selection. */
	readonly value: ValueMap[ComboboxType];
	/** Opens the popup unless the root is disabled. */
	openPopup: () => void;
	/** Toggles the popup. */
	toggle: () => void;
	/** Closes the popup and restores trigger focus. */
	close: () => Promise<void>;
	/** Clears the current selection when permitted. */
	clear: () => void;
	/** Checks whether an item value is selected. */
	isSelected: (itemValue: string) => boolean;
	/** Applies selection behavior for an item value. */
	selectItem: (itemValue: string) => void;
};

const [getComboboxState, setComboboxState] = createContext<ComboboxContextState>();

/**
 * Creates and provides combobox state for descendant parts.
 *
 * @param options - Reactive value and selection mode owned by the root.
 */
export function setComboboxContext<T extends ComboboxType>(options: ComboboxOptions<T>): ComboboxState<T> {
	const ctx = new ComboboxState(options);
	setComboboxState(ctx);
	return ctx;
}

/**
 * Reads the state provided by the nearest combobox root.
 *
 * @returns The shared type-erased combobox state.
 */
export function getComboboxContext(): ComboboxContextState {
	return getComboboxState();
}
