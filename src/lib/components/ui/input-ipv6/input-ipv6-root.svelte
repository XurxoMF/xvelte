<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props for the root IPv6 input and its form value. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		separator?: ":" | " " | "_" | undefined;
		placeholder?: string | undefined;
		value?: string | null | undefined;
		valid?: boolean | undefined;
		name?: string | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { isHexDigit, isValidIPv6, safeParseIPv6, type IPv6Segments } from "./input-ipv6-utils";

	let {
		separator = ":",
		value = $bindable(null),
		placeholder,
		class: className,
		name,
		valid = $bindable(false),
		ref = $bindable(null),
		...restProps
	}: RootProps = $props();

	const parsedPlaceholder = $derived(safeParseIPv6(placeholder));
	const hextets: IPv6Segments = $derived(safeParseIPv6(value ?? "") ?? [null, null, null, null, null, null, null, null]);
	const inputs = $state<HTMLInputElement[]>([]);
	const after: Array<(() => void) | undefined> = [];

	/** @param next - Eight partial hextets to join with the configured separator. */
	function format(next: IPv6Segments): string {
		return next.join(separator);
	}

	/**
	 * @param index - Segment index to replace.
	 * @param hextet - Partial value emitted by that segment.
	 */
	function update(index: number, hextet: number | string | null) {
		const next = [...hextets] as IPv6Segments;
		next[index] = hextet === null || hextet === "" ? null : hextet.toString().toLowerCase();
		value = format(next);
	}

	/** @param event - Paste event whose text should populate all eight segments. */
	function paste(event: ClipboardEvent) {
		const parsed = safeParseIPv6(event.clipboardData?.getData("text"));
		if (!parsed) return;

		event.preventDefault();
		value = format(parsed);
	}

	/** @param index - Segment whose deferred navigation should run after its input value commits. */
	function handleInput(index: number) {
		after[index]?.();
		after[index] = undefined;
	}

	/**
	 * Preserves hexadecimal constraints and coordinated focus movement for one internal hextet.
	 *
	 * @param event - Keyboard event emitted by the hextet input.
	 * @param index - Hextet position within the address.
	 */
	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.ctrlKey || event.metaKey) return;
		if (event.key === "Tab" || event.key === "Delete") return;

		const hextet = hextets[index];
		const target = event.currentTarget as HTMLInputElement;

		if (event.key === "Backspace") {
			if (hextet === null || hextet.toString().length === 0) setTimeout(() => inputs[index - 1]?.focus(), 2);
			return;
		}

		if ([":", " ", "_"].includes(event.key)) {
			event.preventDefault();
			inputs[index + 1]?.focus();
			return;
		}

		if (event.key === "ArrowRight") {
			if (target.selectionStart === target.value.length) {
				event.preventDefault();
				inputs[index + 1]?.focus();
			}
			return;
		}

		if (event.key === "ArrowLeft") {
			if (target.selectionStart === 0) {
				event.preventDefault();
				inputs[index - 1]?.focus();
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
			inputs[index + 1]?.focus();
			return;
		}

		if (nextValue.length === 4) after[index] = () => inputs[index + 1]?.focus();
	}

	$effect(() => {
		valid = isValidIPv6(value);
	});
</script>

<div
	bind:this={ref}
	data-slot="ipv6-input"
	aria-invalid={!valid}
	class={cn(
		"flex h-9 w-full place-items-center rounded-md border border-input bg-background px-3 font-mono font-light ring-2 ring-transparent ring-offset-background selection:bg-primary focus-within:ring-ring focus-within:ring-offset-2 dark:bg-input/30",
		className
	)}
	{...restProps}
>
	{#each [0, 1, 2, 3, 4, 5, 6, 7] as index (index)}
		<input
			bind:this={inputs[index]}
			data-slot="ipv6-input-segment"
			maxlength={4}
			tabindex={index === 0 ? undefined : -1}
			bind:value={() => hextets[index], (hextet) => update(index, hextet)}
			placeholder={parsedPlaceholder?.[index] ?? undefined}
			type="text"
			inputmode="text"
			autocomplete="off"
			spellcheck="false"
			class="h-full min-w-0 flex-1 border-0 bg-transparent text-center uppercase outline-hidden placeholder:text-muted-foreground focus:outline-hidden"
			oninput={() => handleInput(index)}
			onkeydown={(event) => handleKeydown(event, index)}
			onpaste={paste}
		/>

		{#if index < 7}<span class="shrink-0 font-mono">{separator}</span>{/if}
	{/each}
</div>

<input data-slot="ipv6-input-value" class="hidden" tabindex={-1} {name} {value} />
