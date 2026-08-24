<script lang="ts" module>
	import type { CountryCode } from "libphonenumber-js/min";

	import type { TriggerProps as ComboboxTriggerProps } from "$lib/components/ui/combobox";

	/** Props for the context-controlled searchable country selector. */
	export type CountrySelectorProps = Omit<ComboboxTriggerProps, "children" | "disabled"> & {
		/** Classes merged onto the selector popover. */
		contentClass?: string | undefined;
		/** Country search placeholder. */
		searchPlaceholder?: string | undefined;
		/** Message shown when no country matches the search. */
		emptyText?: string | undefined;
		/** Runs after a country is selected through this component. */
		onchange?: ((country: CountryCode) => void) | undefined;
	};
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";
	import * as Combobox from "$lib/components/ui/combobox";

	import { getInputPhoneContext } from "./input-phone-context.svelte";

	let {
		class: className,
		contentClass,
		searchPlaceholder = m.harbor_wren_pause(),
		emptyText = m.kind_badger_country(),
		onchange,
		"aria-label": ariaLabel,
		...triggerProps
	}: CountrySelectorProps = $props();

	const ctx = getInputPhoneContext();

	const selectedCountry = $derived(ctx.countries.find((country) => country.code === ctx.country));
	const defaultLabel = $derived(
		selectedCountry ? m.nimble_lynx_country({ country: selectedCountry.name, callingCode: selectedCountry.callingCode }) : m.mellow_ibis_country()
	);

	let selectedValue = $state("");

	$effect(() => {
		const nextValue = selectedCountry?.searchValue ?? "";
		if (selectedValue !== nextValue) selectedValue = nextValue;
	});

	/** Updates Root country state before forwarding the selector callback. */
	function selectCountry(value: string) {
		const country = ctx.countries.find((item) => item.searchValue === value);
		if (!country) return;

		ctx.selectCountry(country.code);
		onchange?.(country.code);
	}
</script>

{#snippet phoneFlag(country: CountryCode | null | undefined)}
	<span
		data-slot="input-phone-flag"
		aria-hidden="true"
		class="flex h-4 w-6 shrink-0 overflow-clip rounded-sm bg-foreground/20 [&>svg]:h-4! [&>svg]:w-6!"
	>
		{#await ctx.getFlag(country ?? null) then flag}
			{#if flag}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html flag}
			{/if}
		{/await}
	</span>
{/snippet}

<Combobox.Root bind:value={selectedValue} onchange={selectCountry}>
	<Combobox.Trigger
		{...triggerProps}
		data-slot="input-phone-country-selector"
		aria-label={ariaLabel ?? defaultLabel}
		disabled={ctx.disabled}
		data-input-phone-country-selector=""
		class={cn("w-auto shrink-0", className)}
	>
		{@render phoneFlag(selectedCountry?.code)}
		<span>{selectedCountry ? "+" + selectedCountry.callingCode : "—"}</span>
	</Combobox.Trigger>

	<Combobox.Content class={cn("w-80", contentClass)}>
		<Combobox.Input placeholder={searchPlaceholder} />

		<Combobox.Empty>{emptyText}</Combobox.Empty>

		<Combobox.List>
			{#each ctx.countries as country (country.code)}
				<Combobox.Item value={country.searchValue}>
					{@render phoneFlag(country.code)}
					<span class="min-w-0 flex-1 truncate">{country.name}</span>
					<span class="shrink-0 text-muted-foreground">+{country.callingCode}</span>
				</Combobox.Item>
			{/each}
		</Combobox.List>
	</Combobox.Content>
</Combobox.Root>
