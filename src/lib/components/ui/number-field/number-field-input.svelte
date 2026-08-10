<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type InputProps = WithElementRef<Omit<HTMLInputAttributes, "min" | "max" | "value" | "type">>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { useNumberFieldInput } from "./number-field.svelte.js";

	let { ref = $bindable(null), class: className, ...restProps }: InputProps = $props();

	const inputState = useNumberFieldInput();
</script>

<input
	class={cn("h-9 flex-1 rounded-md border border-border px-4 text-center outline-none aria-invalid:border-destructive", className)}
	bind:this={ref}
	data-slot="number-field-input"
	bind:value={inputState.rootState.opts.value.current}
	{...inputState.props}
	{...restProps}
/>

<style>
	input[type="number"] {
		appearance: none;
		-moz-appearance: textfield;
	}

	input[type="number"]::-webkit-outer-spin-button,
	input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
