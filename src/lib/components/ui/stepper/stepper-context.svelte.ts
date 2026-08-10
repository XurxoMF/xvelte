import { createContext, onDestroy } from "svelte";

export type StepperOrientation = "horizontal" | "vertical";
export type StepperItemState = "active" | "completed" | "inactive";

export type StepperOptions = {
	step: number;
	readonly orientation: StepperOrientation;
};

/** Registers step items and coordinates selection and keyboard focus. */
export class StepperContext {
	items = $state<StepperItemContext[]>([]);

	/**
	 * @param options - Reactive values owned by the stepper root.
	 */
	constructor(private readonly options: StepperOptions) {}

	/** @returns The currently selected one-based step. */
	get step() {
		return this.options.step;
	}

	/** Updates the currently selected one-based step. */
	set step(value: number) {
		this.options.step = value;
	}

	/** @returns The current layout and keyboard-navigation orientation. */
	get orientation() {
		return this.options.orientation;
	}

	/** @returns Whether another registered step follows the current one. */
	get canIncrement() {
		return this.step < this.items.length;
	}

	/** @returns Whether another registered step precedes the current one. */
	get canDecrement() {
		return this.step > 1;
	}

	/**
	 * Adds an item to the ordered registry.
	 *
	 * @param item - Step item being mounted.
	 * @returns A cleanup function that removes the item when it unmounts.
	 */
	register(item: StepperItemContext) {
		this.items.push(item);

		return () => {
			const index = this.items.indexOf(item);
			if (index === -1) return;

			const removedStep = index + 1;
			this.items.splice(index, 1);

			// Keep the same logical item selected when an earlier item disappears,
			// or clamp the selection when the final active item is removed.
			if (this.step > removedStep) this.step--;
			else if (this.step > this.items.length) this.step = Math.max(1, this.items.length);
		};
	}

	/** @param item - Registered item whose one-based position should be returned. */
	getItemStep(item: StepperItemContext) {
		return this.items.indexOf(item) + 1;
	}

	/** @param item - Registered item to select. */
	select(item: StepperItemContext) {
		const step = this.getItemStep(item);
		if (step > 0) this.step = step;
	}

	/** Advances the selected step when another item exists. */
	next() {
		if (this.canIncrement) this.step++;
	}

	/** Moves to the previous step when the current item is not the first. */
	previous() {
		if (this.canDecrement) this.step--;
	}

	/**
	 * Selects and focuses the next enabled trigger in one direction.
	 *
	 * @param direction - Direction in which to search the item registry.
	 */
	navigate(direction: 1 | -1) {
		let index = this.step - 1 + direction;

		while (index >= 0 && index < this.items.length) {
			const item = this.items[index];
			const trigger = item.trigger;

			if (trigger && !trigger.disabled) {
				this.step = index + 1;
				trigger.focus();
				return;
			}

			index += direction;
		}
	}
}

/** Represents one registered item and derives its position and visual state. */
export class StepperItemContext {
	readonly stepper = getStepperContext();
	trigger = $state<HTMLButtonElement | null>(null);

	/**
	 * @param id - Stable identifier for the item.
	 */
	constructor(readonly id: string) {
		onDestroy(this.stepper.register(this));
	}

	/** @returns The item's current one-based position. */
	get step() {
		return this.stepper.getItemStep(this);
	}

	/** @returns Whether this is the final registered item. */
	get isLast() {
		return this.step === this.stepper.items.length;
	}

	/** @returns The item's state relative to the selected step. */
	get state(): StepperItemState {
		if (this.step < this.stepper.step) return "completed";
		if (this.step === this.stepper.step) return "active";
		return "inactive";
	}
}

const [getStepperContext, provideStepperContext] = createContext<StepperContext>();

const [getStepperItemContext, provideStepperItemContext] = createContext<StepperItemContext>();

/**
 * Creates and provides the state shared by every part of a stepper.
 *
 * @param options - Reactive values owned by the stepper root.
 */
export function setStepperContext(options: StepperOptions) {
	return provideStepperContext(new StepperContext(options));
}

/** @returns The state from the nearest stepper root. */
export { getStepperContext };

/**
 * Creates, registers and provides the state for one step item.
 *
 * @param id - Stable identifier for the item.
 * @returns The item state provided to nested parts.
 */
export function setStepperItemContext(id: string) {
	return provideStepperItemContext(new StepperItemContext(id));
}

/** @returns The state from the nearest step item. */
export { getStepperItemContext };
