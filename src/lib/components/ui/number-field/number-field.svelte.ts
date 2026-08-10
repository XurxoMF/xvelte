import type { FormEventHandler } from "svelte/elements";

import { Context } from "runed";
import type { ReadableBoxedValues, WritableBoxedValues } from "svelte-toolbelt";

import { useRamp, type UseRampOptions } from "$lib/hooks/use-ramp.svelte";
import type { RootProps as ButtonProps } from "$lib/components/ui/button";

type NumberFieldRootProps = WritableBoxedValues<{
	value: number;
}> &
	ReadableBoxedValues<{
		step: number;
		min?: number | undefined;
		max?: number | undefined;
		rampSettings: Omit<UseRampOptions, "increment" | "canRamp">;
	}>;

/** Holds the shared value constraints and validity of a number field. */
class NumberFieldRootContext {
	/** @param opts - Boxed value, bounds, step, and ramp settings. */
	constructor(readonly opts: NumberFieldRootProps) {}

	valid = $derived.by(() => {
		const value = this.opts.value.current;
		const min = this.opts.min?.current;
		const max = this.opts.max?.current;

		return (min === undefined || value >= min) && (max === undefined || value <= max);
	});
}

/** Builds the native input behavior from number-field root state. */
class NumberFieldInputContext {
	/** @param rootState - Number-field state shared by the root. */
	constructor(readonly rootState: NumberFieldRootContext) {}

	/** @param e - Native input event whose value is clamped to the configured bounds. */
	oninput: FormEventHandler<HTMLInputElement> = (e) => {
		const value = e.currentTarget.value;

		if (this.rootState.opts.min?.current !== undefined && Number(value) < this.rootState.opts.min.current) {
			this.rootState.opts.value.current = this.rootState.opts.min.current;
		}
		if (this.rootState.opts.max?.current !== undefined && Number(value) > this.rootState.opts.max.current) {
			this.rootState.opts.value.current = this.rootState.opts.max.current;
		}
	};

	props = $derived.by(() => ({
		type: "number",
		oninput: this.oninput,
		min: this.rootState.opts.min?.current,
		max: this.rootState.opts.max?.current,
		"aria-invalid": !this.rootState.valid,
		step: this.rootState.opts.step.current
	}));
}

type NumberFieldButtonProps = {
	direction: "up" | "down";
} & ReadableBoxedValues<{
	onpointerdown: ButtonProps["onpointerdown"];
	onpointerup: ButtonProps["onpointerup"];
	onpointerleave: ButtonProps["onpointerleave"];
	onpointercancel: ButtonProps["onpointercancel"];
	onclick: ButtonProps["onclick"];
	disabled: boolean;
}>;

/** Coordinates pointer interaction and press-and-hold repetition for one step button. */
class NumberFieldButton {
	rampState: ReturnType<typeof useRamp>;
	pointerTriggered = false;
	/**
	 * @param rootState - Number-field value and constraints.
	 * @param opts - Direction, disabled state, and forwarded pointer handlers.
	 */
	constructor(
		readonly rootState: NumberFieldRootContext,
		readonly opts: NumberFieldButtonProps
	) {
		this.increment = this.increment.bind(this);
		this.rampState = useRamp({
			increment: () => this.increment(),
			canRamp: () => this.enabled,
			...this.rootState.opts.rampSettings.current
		});
	}

	/** @param e - Pointer event beginning an increment and ramp cycle. */
	onpointerdown(e: Parameters<NonNullable<ButtonProps["onpointerdown"]>>[0]) {
		this.pointerTriggered = true;
		this.increment();

		this.rampState.start();

		this.opts.onpointerdown.current?.(e);
	}

	/** @param e - Pointer event ending the current ramp cycle. */
	onpointerup(e: Parameters<NonNullable<ButtonProps["onpointerup"]>>[0]) {
		this.rampState.reset();
		this.opts.onpointerup.current?.(e);
	}

	/** @param e - Pointer event cancelling repetition after leaving the button. */
	onpointerleave(e: Parameters<NonNullable<ButtonProps["onpointerleave"]>>[0]) {
		this.rampState.reset();
		this.opts.onpointerleave.current?.(e);
	}

	/** @param e - Cancelled pointer event that also clears click suppression. */
	onpointercancel(e: Parameters<NonNullable<ButtonProps["onpointercancel"]>>[0]) {
		this.rampState.reset();
		this.pointerTriggered = false;
		this.opts.onpointercancel.current?.(e);
	}

	/** @param e - Click event used for keyboard activation or final pointer cleanup. */
	onclick(e: Parameters<NonNullable<ButtonProps["onclick"]>>[0]) {
		if (!this.pointerTriggered) this.increment();
		this.pointerTriggered = false;
		this.opts.onclick.current?.(e);
	}

	/** Applies one positive or negative step to the bound value. */
	increment() {
		const step = this.opts.direction === "up" ? this.rootState.opts.step.current : -this.rootState.opts.step.current;
		this.rootState.opts.value.current += step;
	}

	enabled = $derived.by(() => {
		const step = this.opts.direction === "up" ? this.rootState.opts.step.current : -this.rootState.opts.step.current;

		const newValue = this.rootState.opts.value.current + step;

		if (this.rootState.opts.min?.current !== undefined && newValue < this.rootState.opts.min.current) {
			return false;
		}

		if (this.rootState.opts.max?.current !== undefined && newValue > this.rootState.opts.max.current) {
			return false;
		}

		return true;
	});

	props = $derived.by(() => ({
		disabled: !this.enabled || this.opts.disabled.current,
		onpointerdown: this.onpointerdown.bind(this),
		onpointerup: this.onpointerup.bind(this),
		onpointerleave: this.onpointerleave.bind(this),
		onpointercancel: this.onpointercancel.bind(this),
		onclick: this.onclick.bind(this)
	}));

	/** Cancels pending ramp timers when the button is destroyed. */
	destroy() {
		this.rampState.reset();
	}
}

const ctx = new Context<NumberFieldRootContext>("number-field-root");

/** @param props - Boxed value and constraints to provide to number-field parts. */
export function useNumberField(props: NumberFieldRootProps) {
	return ctx.set(new NumberFieldRootContext(props));
}

/** @returns Native input behavior connected to the nearest number field. */
export function useNumberFieldInput() {
	return new NumberFieldInputContext(ctx.get());
}

/** @param props - Direction and forwarded event handlers for the step button. */
export function useNumberFieldButton(props: NumberFieldButtonProps) {
	return new NumberFieldButton(ctx.get(), props);
}
