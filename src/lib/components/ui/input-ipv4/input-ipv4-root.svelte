<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		separator?: "." | " " | "_" | undefined;
		placeholder?: string | undefined;
		value?: string | null | undefined;
		valid?: boolean | undefined;
		name?: string | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import { isNumber, isValidIPv4, safeParseIPv4 } from "./input-ipv4-utils";

	type PartialOctet = number | string | null;
	type PartialOctets = [PartialOctet, PartialOctet, PartialOctet, PartialOctet];

	let {
		separator = ".",
		value = $bindable(null),
		placeholder,
		class: className,
		name,
		valid = $bindable(false),
		ref = $bindable(null),
		...restProps
	}: RootProps = $props();

	const parsedPlaceholder = $derived(safeParseIPv4(placeholder));
	const octets: PartialOctets = $derived(safeParseIPv4(value ?? "") ?? [null, null, null, null]);
	const inputs = $state<HTMLInputElement[]>([]);
	const after: Array<(() => void) | undefined> = [];

	/** @param octet - Candidate segment to normalize within the IPv4 byte range. */
	function validate(octet: string | null): number | null {
		if (octet === null || !isNumber(octet)) return null;
		const number = Number.parseInt(octet);
		return number >= 0 && number <= 255 ? number : null;
	}

	/** @param next - Four partial octets to join with the configured separator. */
	function format(next: PartialOctets): string {
		return next.join(separator);
	}

	/**
	 * @param index - Segment index to replace.
	 * @param octet - Partial value emitted by that segment.
	 */
	function update(index: number, octet: PartialOctet) {
		const next = [...octets] as PartialOctets;
		next[index] = octet === "" ? null : octet;
		value = format(next);
	}

	/** @param event - Paste event whose text should populate all four segments. */
	function paste(event: ClipboardEvent) {
		const parsed = safeParseIPv4(event.clipboardData?.getData("text"));
		if (!parsed) return;
		event.preventDefault();
		value = format(parsed.map(validate) as PartialOctets);
	}

	/** @param index - Segment whose deferred navigation should run after its input value commits. */
	function handleInput(index: number) {
		after[index]?.();
		after[index] = undefined;
	}

	/**
	 * Preserves numeric constraints and coordinated focus movement for one internal octet.
	 *
	 * @param event - Keyboard event emitted by the octet input.
	 * @param index - Octet position within the address.
	 */
	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.ctrlKey || event.metaKey) return;
		if (event.key === "Tab" || event.key === "Delete") return;

		const octet = octets[index];
		const target = event.currentTarget as HTMLInputElement;

		if (event.key === "Backspace") {
			if (octet === null || octet.toString().length === 0) setTimeout(() => inputs[index - 1]?.focus(), 2);
			return;
		}

		if ([".", " ", "_"].includes(event.key)) {
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

		if (!isNumber(event.key)) {
			event.preventDefault();
			return;
		}

		const nextValue = target.value + event.key;

		if (nextValue.length > 3 || Number.parseInt(nextValue) > 255) {
			event.preventDefault();
			inputs[index + 1]?.focus();
			return;
		}

		if (nextValue.length === 3) after[index] = () => inputs[index + 1]?.focus();
	}

	$effect(() => {
		valid = isValidIPv4(value);
	});
</script>

<div
	bind:this={ref}
	data-slot="ipv4-input"
	aria-invalid={!valid}
	class={cn(
		"flex h-9 w-full place-items-center rounded-md border border-input bg-background px-3 font-mono font-light transition-colors selection:bg-primary focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
		className
	)}
	{...restProps}
>
	{#each [0, 1, 2, 3] as index (index)}
		<input
			bind:this={inputs[index]}
			data-slot="ipv4-input-segment"
			min={0}
			max={255}
			maxlength={3}
			tabindex={index === 0 ? undefined : -1}
			bind:value={() => octets[index], (octet) => update(index, octet)}
			placeholder={parsedPlaceholder?.[index] ?? undefined}
			type="text"
			class="hide-ramp h-full min-w-0 flex-1 border-0 bg-transparent text-center placeholder:text-muted-foreground focus-visible:ring-0"
			oninput={() => handleInput(index)}
			onkeydown={(event) => handleKeydown(event, index)}
			onpaste={paste}
		/>

		{#if index < 3}<span class="shrink-0 font-mono">{separator}</span>{/if}
	{/each}
</div>

<input data-slot="ipv4-input-value" class="hidden" tabindex={-1} {name} {value} />

<style lang="postcss">
	.hide-ramp::-webkit-inner-spin-button,
	.hide-ramp::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
