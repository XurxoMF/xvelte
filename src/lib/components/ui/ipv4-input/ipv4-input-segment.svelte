<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type SegmentProps = WithElementRef<HTMLInputAttributes, HTMLInputElement> & {
		value?: number | string | null | undefined;
		goNext?: (() => void) | undefined;
		goPrevious?: (() => void) | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { isNumber } from "./ipv4-input-utils";

	let { value = $bindable(null), goPrevious, goNext, ref = $bindable(), class: className, ...restProps }: SegmentProps = $props();

	/** Deferred navigation used to keep input ordering consistent across browsers. */
	let after: (() => void) | undefined = undefined;

	/** @param e - Keyboard event controlling numeric input and movement between segments. */
	const onKeydown = (e: KeyboardEvent) => {
		if (e.ctrlKey || e.metaKey) return;

		// Let native focus and deletion behavior handle these keys.
		if (e.key == "Tab" || e.key == "Delete") return;

		// Backspace on an empty segment returns focus to the previous one.
		if (e.key == "Backspace") {
			if (value == null || value.toString().length == 0) {
				// A short delay keeps focus movement consistent across browser input timing.
				setTimeout(() => goPrevious?.(), 2);
			}
			return;
		}

		// Separators advance without becoming part of the segment value.
		if ([".", " "].includes(e.key) && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			goNext?.();
			return;
		}

		const target = e.target as HTMLInputElement;

		if (e.key == "ArrowRight") {
			// Horizontal arrows cross segments only at the corresponding text boundary.
			if (target.selectionStart == target.value.length) {
				e.preventDefault();
				goNext?.();
			}
			return;
		}

		if (e.key == "ArrowLeft") {
			if (target.selectionStart == 0) {
				e.preventDefault();
				goPrevious?.();
			}
			return;
		}

		// Reject remaining non-numeric keys so segment parsing stays deterministic.
		if (!isNumber(e.key)) {
			e.preventDefault();
			return;
		}

		const newValue = (e.target as HTMLInputElement).value + e.key;

		if (newValue.length > 3) {
			e.preventDefault();
			goNext?.();
			return;
		}

		const integerValue = parseInt(newValue);

		// An overflowing value advances instead of leaving an invalid octet behind.
		if (integerValue > 255) {
			e.preventDefault();
			goNext?.();
			return;
		}

		// Guard the numeric range even though only digit keys reach this branch.
		if (integerValue < 0) {
			e.preventDefault();
			return;
		}

		if (newValue.length == 3) {
			// Move after the native input event has committed the third digit.
			after = () => goNext?.();
			return;
		}
	};

	/** Runs deferred navigation after the browser commits the input value. */
	const onInput = () => {
		after?.();
		after = undefined;
	};
</script>

<input
	bind:this={ref}
	data-slot="ipv4-input-segment"
	min={0}
	max={255}
	maxlength={3}
	bind:value
	oninput={onInput}
	onkeydown={onKeydown}
	type="text"
	class={cn(
		"hide-ramp h-full w-9 border-0 bg-transparent text-center outline-hidden placeholder:text-muted-foreground focus:outline-hidden",
		className
	)}
	{...restProps}
/>

<style lang="postcss">
	.hide-ramp::-webkit-inner-spin-button,
	.hide-ramp::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
