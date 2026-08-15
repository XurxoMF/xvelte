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

	import Segment from "./input-ipv6-segment.svelte";
	import { isValidIPv6, safeParseIPv6, type IPv6Segments } from "./input-ipv6-utils";

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

	$effect(() => {
		valid = isValidIPv6(value);
	});
</script>

<div
	bind:this={ref}
	data-slot="ipv6-input"
	aria-invalid={!valid}
	class={cn(
		"flex h-9 w-fit place-items-center rounded-md border border-input bg-background px-3 font-mono font-light ring-2 ring-transparent ring-offset-background selection:bg-primary focus-within:ring-ring focus-within:ring-offset-2 dark:bg-input/30",
		className
	)}
	{...restProps}
>
	{#each [0, 1, 2, 3, 4, 5, 6, 7] as index (index)}
		<Segment
			bind:ref={inputs[index]}
			tabindex={index === 0 ? undefined : -1}
			goNext={() => inputs[index + 1]?.focus()}
			goPrevious={() => inputs[index - 1]?.focus()}
			bind:value={() => hextets[index], (hextet) => update(index, hextet)}
			placeholder={parsedPlaceholder?.[index] ?? undefined}
			onpaste={paste}
		/>

		{#if index < 7}<span class="font-mono">{separator}</span>{/if}
	{/each}
</div>

<input data-slot="ipv6-input-value" class="hidden" tabindex={-1} {name} {value} />
