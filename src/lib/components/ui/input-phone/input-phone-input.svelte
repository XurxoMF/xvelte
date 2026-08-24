<script lang="ts" module>
	import type { RootProps as BaseInputProps } from "$lib/components/ui/input";

	/** Props for the context-controlled telephone input. */
	export type InputProps = Omit<
		BaseInputProps,
		"value" | "type" | "files" | "disabled" | "readonly" | "required" | "aria-invalid" | "data-slot" | "ref"
	> & {
		/** Bindable reference to the native telephone input. */
		ref?: HTMLInputElement | null | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import * as Input from "$lib/components/ui/input";

	import { getInputPhoneContext } from "./input-phone-context.svelte";

	let { ref = $bindable(null), class: className, autocomplete = "tel", inputmode = "tel", oninput, onblur, ...restProps }: InputProps = $props();

	const ctx = getInputPhoneContext();

	/** Updates Root state before forwarding the native input event. */
	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		ctx.updateInput(event.currentTarget.value);
		oninput?.(event);
	}

	/** Applies stable display formatting before forwarding the native blur event. */
	function handleBlur(event: FocusEvent & { currentTarget: HTMLInputElement }) {
		ctx.formatInput();
		onblur?.(event);
	}

	$effect(() => {
		ctx.inputRef = ref;
	});
</script>

<Input.Root
	bind:ref
	type="tel"
	value={ctx.inputValue}
	data-slot="input-phone-input"
	data-input-phone-input
	{autocomplete}
	{inputmode}
	disabled={ctx.disabled}
	readonly={ctx.readonly}
	required={ctx.required}
	aria-invalid={!ctx.valid && (ctx.required || ctx.inputValue.length > 0)}
	class={cn(className)}
	oninput={handleInput}
	onblur={handleBlur}
	{...restProps}
/>
