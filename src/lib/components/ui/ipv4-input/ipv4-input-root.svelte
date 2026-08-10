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

	import { isNumber, isValidIPv4, safeParseIPv4 } from "./ipv4-input-utils";
	import Input from "./ipv4-input-segment.svelte";

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

	$effect(() => {
		valid = isValidIPv4(value);
	});
</script>

<div
	bind:this={ref}
	data-slot="ipv4-input"
	aria-invalid={!valid}
	class={cn(
		"flex h-9 w-fit place-items-center rounded-md border border-input bg-background px-3 font-mono font-light ring-2 ring-transparent ring-offset-background selection:bg-primary focus-within:ring-ring focus-within:ring-offset-2 dark:bg-input/30",
		className
	)}
	{...restProps}
>
	{#each [0, 1, 2, 3] as index (index)}
		<Input
			bind:ref={inputs[index]}
			tabindex={index === 0 ? undefined : -1}
			goNext={() => inputs[index + 1]?.focus()}
			goPrevious={() => inputs[index - 1]?.focus()}
			bind:value={() => octets[index], (octet) => update(index, octet)}
			placeholder={parsedPlaceholder?.[index] ?? undefined}
			onpaste={paste}
		/>

		{#if index < 3}<span class="font-mono">{separator}</span>{/if}
	{/each}
</div>

<input data-slot="ipv4-input-value" class="hidden" tabindex={-1} {name} {value} />
