<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props for one editable IPv6 hextet. */
	export type SegmentProps = WithElementRef<HTMLInputAttributes, HTMLInputElement> & {
		value?: number | string | null | undefined;
		goNext?: (() => void) | undefined;
		goPrevious?: (() => void) | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { isHexDigit } from "./ipv6-input-utils";

	let { value = $bindable(null), goPrevious, goNext, ref = $bindable(), class: className, onkeydown, oninput, ...restProps }: SegmentProps = $props();

	/** Deferred navigation used to keep input ordering consistent across browsers. */
	let after: (() => void) | undefined = undefined;

	/** @param event - Keyboard event controlling hexadecimal input and movement between segments. */
	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) return;
		if (event.key === "Tab" || event.key === "Delete") return;

		if (event.key === "Backspace") {
			if (value === null || value === undefined || value.toString().length === 0) {
				// A short delay keeps focus movement consistent across browser input timing.
				setTimeout(() => goPrevious?.(), 2);
			}
			return;
		}

		if ([":", " ", "_"].includes(event.key)) {
			event.preventDefault();
			goNext?.();
			return;
		}

		const target = event.currentTarget as HTMLInputElement;

		if (event.key === "ArrowRight") {
			if (target.selectionStart === target.value.length) {
				event.preventDefault();
				goNext?.();
			}
			return;
		}

		if (event.key === "ArrowLeft") {
			if (target.selectionStart === 0) {
				event.preventDefault();
				goPrevious?.();
			}
			return;
		}

		if (!isHexDigit(event.key)) {
			event.preventDefault();
			return;
		}

		const selectionStart = target.selectionStart ?? target.value.length;
		const selectionEnd = target.selectionEnd ?? selectionStart;
		const nextValue = target.value.slice(0, selectionStart) + event.key + target.value.slice(selectionEnd);

		if (nextValue.length > 4) {
			event.preventDefault();
			goNext?.();
			return;
		}

		if (nextValue.length === 4) after = () => goNext?.();
	}

	/** Runs deferred navigation after the browser commits the input value. */
	function handleInput() {
		after?.();
		after = undefined;
	}
</script>

<input
	bind:this={ref}
	data-slot="ipv6-input-segment"
	maxlength={4}
	bind:value
	oninput={(event) => {
		handleInput();
		oninput?.(event);
	}}
	onkeydown={(event) => {
		handleKeydown(event);
		onkeydown?.(event);
	}}
	type="text"
	inputmode="text"
	autocomplete="off"
	spellcheck="false"
	class={cn(
		"h-full w-12 border-0 bg-transparent text-center uppercase outline-hidden placeholder:text-muted-foreground focus:outline-hidden",
		className
	)}
	{...restProps}
/>
