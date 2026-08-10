import { createContext } from "svelte";
import type { FormEventHandler } from "svelte/elements";

import { useRamp, type UseRampOptions } from "$lib/hooks/use-ramp.svelte";
import type { RootProps as ButtonProps } from "$lib/components/ui/button";

type NumberFieldOptions = {
	value: number;
	readonly step: number;
	readonly min: number | undefined;
	readonly max: number | undefined;
	readonly rampSettings: Omit<UseRampOptions, "increment" | "canRamp">;
};

type NumberFieldButtonOptions = {
	direction: "up" | "down";
	readonly onpointerdown: ButtonProps["onpointerdown"];
	readonly onpointerup: ButtonProps["onpointerup"];
	readonly onpointerleave: ButtonProps["onpointerleave"];
	readonly onpointercancel: ButtonProps["onpointercancel"];
	readonly onclick: ButtonProps["onclick"];
	readonly disabled: boolean;
};

/** Holds the shared value, constraints, validity, and native input behavior. */
export class NumberFieldContext {
	/** @param options - Reactive value, bounds, step, and ramp settings. */
	constructor(readonly options: NumberFieldOptions) {}

	/** Current bound numeric value. */
	get value() {
		return this.options.value;
	}

	set value(value: number) {
		this.options.value = value;
	}

	valid = $derived.by(() => {
		return (this.options.min === undefined || this.value >= this.options.min) && (this.options.max === undefined || this.value <= this.options.max);
	});

	/** @param event - Native input event whose value is clamped to the configured bounds. */
	oninput: FormEventHandler<HTMLInputElement> = (event) => {
		const value = Number(event.currentTarget.value);

		if (this.options.min !== undefined && value < this.options.min) this.value = this.options.min;
		if (this.options.max !== undefined && value > this.options.max) this.value = this.options.max;
	};

	inputProps = $derived.by(() => ({
		type: "number" as const,
		oninput: this.oninput,
		min: this.options.min,
		max: this.options.max,
		"aria-invalid": !this.valid,
		step: this.options.step
	}));
}

/** Coordinates pointer interaction and press-and-hold repetition for one step button. */
export class NumberFieldButtonState {
	readonly root = getNumberFieldContext();
	rampState: ReturnType<typeof useRamp>;
	pointerTriggered = false;

	/** @param options - Direction, disabled state, and forwarded pointer handlers. */
	constructor(readonly options: NumberFieldButtonOptions) {
		this.rampState = useRamp({
			increment: () => this.increment(),
			canRamp: () => this.enabled,
			...this.root.options.rampSettings
		});
	}

	/** @param event - Pointer event beginning an increment and ramp cycle. */
	onpointerdown = (event: Parameters<NonNullable<ButtonProps["onpointerdown"]>>[0]) => {
		this.pointerTriggered = true;
		this.increment();
		this.rampState.start();
		this.options.onpointerdown?.(event);
	};

	/** @param event - Pointer event ending the current ramp cycle. */
	onpointerup = (event: Parameters<NonNullable<ButtonProps["onpointerup"]>>[0]) => {
		this.rampState.reset();
		this.options.onpointerup?.(event);
	};

	/** @param event - Pointer event cancelling repetition after leaving the button. */
	onpointerleave = (event: Parameters<NonNullable<ButtonProps["onpointerleave"]>>[0]) => {
		this.rampState.reset();
		this.options.onpointerleave?.(event);
	};

	/** @param event - Cancelled pointer event that also clears click suppression. */
	onpointercancel = (event: Parameters<NonNullable<ButtonProps["onpointercancel"]>>[0]) => {
		this.rampState.reset();
		this.pointerTriggered = false;
		this.options.onpointercancel?.(event);
	};

	/** @param event - Click event used for keyboard activation or final pointer cleanup. */
	onclick = (event: Parameters<NonNullable<ButtonProps["onclick"]>>[0]) => {
		if (!this.pointerTriggered) this.increment();
		this.pointerTriggered = false;
		this.options.onclick?.(event);
	};

	/** Applies one positive or negative step to the bound value. */
	increment() {
		this.root.value += this.delta;
	}

	/** Signed increment configured for this button. */
	get delta() {
		return this.options.direction === "up" ? this.root.options.step : -this.root.options.step;
	}

	enabled = $derived.by(() => {
		const value = this.root.value + this.delta;

		if (this.root.options.min !== undefined && value < this.root.options.min) return false;
		if (this.root.options.max !== undefined && value > this.root.options.max) return false;

		return true;
	});

	props = $derived.by(() => ({
		disabled: !this.enabled || this.options.disabled,
		onpointerdown: this.onpointerdown,
		onpointerup: this.onpointerup,
		onpointerleave: this.onpointerleave,
		onpointercancel: this.onpointercancel,
		onclick: this.onclick
	}));

	/** Cancels pending ramp timers when the button is destroyed. */
	destroy() {
		this.rampState.reset();
	}
}

const [getNumberFieldContext, provideNumberFieldContext] = createContext<NumberFieldContext>();

/** @param options - Reactive value and constraints to provide to number-field parts. */
export function setNumberFieldContext(options: NumberFieldOptions) {
	return provideNumberFieldContext(new NumberFieldContext(options));
}

/** @returns The state from the nearest number-field root. */
export { getNumberFieldContext };
