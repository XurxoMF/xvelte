import type { HTMLButtonAttributes } from "svelte/elements";

import { Context, watch } from "runed";
import type { ReadableBoxedValues, WritableBoxedValues } from "svelte-toolbelt";

type StepperRootProps = WritableBoxedValues<{
	step: number;
}>;

/** Registers steps and coordinates selection and focus navigation. */
class StepperRootState {
	steps: { id: string; triggerRef: () => HTMLButtonElement | null }[] = $state([]);

	/** @param opts - Boxed current step. */
	constructor(readonly opts: StepperRootProps) {}

	/** @param step - Step item to append to the ordered registry. */
	registerStep(step: StepperItemState): number {
		return this.steps.push({ id: step.opts.id, triggerRef: () => step.getTriggerRef() });
	}

	/** Advances the selected step when another registered step exists. */
	next() {
		if (!this.canIncrement) return;
		this.opts.step.current++;
	}

	canIncrement = $derived.by(() => {
		return this.steps.length > this.opts.step.current;
	});

	/** Moves to the previous step when the current step is not the first. */
	previous() {
		if (!this.canDecrement) return;
		this.opts.step.current--;
	}

	canDecrement = $derived.by(() => {
		return this.opts.step.current > 1;
	});

	/** @param stepId - Registered identifier of the step to select. */
	selectStep(stepId: string) {
		this.opts.step.current = this.steps.findIndex((step) => step.id === stepId) + 1;
	}

	/** Selects and focuses the next enabled trigger during keyboard navigation. */
	navigateNext() {
		const nextStep = this.steps[this.opts.step.current];
		if (!nextStep) return;

		const triggerRef = nextStep.triggerRef();
		if (triggerRef?.disabled) return;

		this.opts.step.current++;
		triggerRef?.focus();
	}

	/** Selects and focuses the previous enabled trigger during keyboard navigation. */
	navigatePrevious() {
		const previousStep = this.steps[this.opts.step.current - 2];
		if (!previousStep) return;

		const triggerRef = previousStep.triggerRef();
		if (triggerRef?.disabled) return;

		this.opts.step.current--;
		triggerRef?.focus();
	}
}

type StepperNavProps = ReadableBoxedValues<{
	orientation: "horizontal" | "vertical";
}>;

/** Exposes orientation attributes for a stepper navigation container. */
class StepperNavState {
	/** @param opts - Boxed navigation orientation. */
	constructor(readonly opts: StepperNavProps) {}

	props = $derived.by(() => ({
		"aria-orientation": this.opts.orientation.current,
		"data-orientation": this.opts.orientation.current
	}));
}

type StepperItemProps = {
	id: string;
};

/** Represents one registered step and derives its position and completion state. */
class StepperItemState {
	step: number;
	triggerRef = $state<HTMLButtonElement | null>(null);
	/**
	 * @param opts - Stable identifier for the step.
	 * @param navState - Parent navigation orientation.
	 * @param rootState - Root registry and selected step.
	 */
	constructor(
		readonly opts: StepperItemProps,
		readonly navState: StepperNavState,
		readonly rootState: StepperRootState
	) {
		this.step = this.rootState.registerStep(this);
	}

	/** @returns The current trigger element for focus navigation. */
	getTriggerRef() {
		return this.triggerRef;
	}

	isLast = $derived.by(() => {
		return this.step === this.rootState.steps.length;
	});

	isFirst = $derived.by(() => {
		return this.step === 1;
	});

	state: "active" | "completed" | "inactive" = $derived.by(() => {
		if (this.step < this.rootState.opts.step.current) return "completed";
		if (this.step === this.rootState.opts.step.current) return "active";
		return "inactive";
	});

	props = $derived.by(() => ({
		id: this.opts.id,
		"data-step": this.opts.id,
		"data-state": this.state
	}));
}

type StepperItemTriggerProps = ReadableBoxedValues<{
	ref: HTMLButtonElement | null;
	disabled: boolean;
	onclick: HTMLButtonAttributes["onclick"];
	onkeydown: HTMLButtonAttributes["onkeydown"];
}>;

/** Connects a step trigger's events and element reference to its item state. */
class StepperItemTriggerState {
	/**
	 * @param opts - Boxed trigger reference, state, and forwarded handlers.
	 * @param itemState - Step item controlled by this trigger.
	 */
	constructor(
		readonly opts: StepperItemTriggerProps,
		readonly itemState: StepperItemState
	) {
		watch(
			() => this.opts.ref.current,
			(ref) => {
				this.itemState.triggerRef = ref;
			}
		);
	}

	/** @param e - Click event selecting the associated step. */
	_onclick(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		this.itemState.rootState.selectStep(this.itemState.opts.id);
		this.opts.onclick.current?.(e);
	}

	/** @param e - Arrow-key event used for orientation-aware step navigation. */
	_onkeydown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (this.opts.disabled.current) return;
		switch (e.key) {
			case "ArrowRight":
				if (this.itemState.navState.opts.orientation.current === "vertical") return;
				this.itemState.rootState.navigateNext();
				break;
			case "ArrowLeft":
				if (this.itemState.navState.opts.orientation.current === "vertical") return;
				this.itemState.rootState.navigatePrevious();
				break;
			case "ArrowDown":
				if (this.itemState.navState.opts.orientation.current === "horizontal") return;
				e.preventDefault(); // prevent default scroll behavior
				this.itemState.rootState.navigateNext();
				break;
			case "ArrowUp":
				if (this.itemState.navState.opts.orientation.current === "horizontal") return;
				e.preventDefault(); // prevent default scroll behavior
				this.itemState.rootState.navigatePrevious();
				break;
		}
		this.opts.onkeydown.current?.(e);
	}

	props = $derived.by(() => ({
		id: `${this.itemState.opts.id}-trigger`,
		disabled: this.opts.disabled.current,
		onclick: this._onclick.bind(this),
		onkeydown: this._onkeydown.bind(this),
		"data-state": this.itemState.state,
		"aria-selected": this.itemState.state === "active"
	}));
}

/** Exposes the preceding item's state to its separator. */
class StepperSeparatorState {
	/** @param itemState - Item immediately before the separator. */
	constructor(readonly itemState: StepperItemState) {}

	props = $derived.by(() => ({
		"data-state": this.itemState.state
	}));
}

type StepperStepButtonProps = ReadableBoxedValues<{
	type: "next" | "previous";
	disabled: boolean;
}>;

/** Controls a generic next or previous step button. */
class StepperStepButtonState {
	/**
	 * @param opts - Button direction and explicit disabled state.
	 * @param rootState - Stepper state to navigate.
	 */
	constructor(
		readonly opts: StepperStepButtonProps,
		readonly rootState: StepperRootState
	) {}

	_disabled = $derived.by(() => {
		if (this.opts.disabled.current) return true;
		if (this.opts.type.current === "next") {
			return !this.rootState.canIncrement;
		}
		return !this.rootState.canDecrement;
	});

	/** Moves the root in the configured direction. */
	onclick() {
		if (this.opts.type.current === "next") {
			this.rootState.next();
			return;
		}
		this.rootState.previous();
	}

	props = $derived.by(() => ({
		disabled: this._disabled,
		onclick: this.onclick.bind(this)
	}));
}

const StepperCtx = new Context<StepperRootState>("stepper-root-ctx");
const StepperNavCtx = new Context<StepperNavState>("stepper-nav-ctx");
const StepperItemCtx = new Context<StepperItemState>("stepper-item-ctx");

/** @param props - Boxed selected step to provide to descendants. */
export function useStepperRoot(props: StepperRootProps) {
	return StepperCtx.set(new StepperRootState(props));
}

/** @param props - Boxed orientation for the navigation container. */
export function useStepperNav(props: StepperNavProps) {
	return StepperNavCtx.set(new StepperNavState(props));
}

/** @param props - Stable identifier for a registered step. */
export function useStepperItem(props: StepperItemProps) {
	return StepperItemCtx.set(new StepperItemState(props, StepperNavCtx.get(), StepperCtx.get()));
}

/** @param props - Boxed trigger reference, disabled state, and event handlers. */
export function useStepperItemTrigger(props: StepperItemTriggerProps) {
	return new StepperItemTriggerState(props, StepperItemCtx.get());
}

/** @returns Separator state connected to the nearest step item. */
export function useStepperSeparator() {
	return new StepperSeparatorState(StepperItemCtx.get());
}

/** @param props - Boxed direction and disabled state for a navigation button. */
export function useStepperStepButton(props: StepperStepButtonProps) {
	return new StepperStepButtonState(props, StepperCtx.get());
}
