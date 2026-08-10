<script lang="ts" module>
	import type { Country, CountryCode } from "svelte-tel-input/types";

	export type CountrySelectorProps = {
		/** List of countries */
		countries: Country[];
		disabled?: boolean | undefined;
		selected?: CountryCode | null | undefined;
		onselect?: ((val: CountryCode | null) => void) | undefined;
		/** Comparator for country ordering; defaults to alphabetical country names. */
		order?: ((a: Country, b: Country) => number) | undefined;
	};
</script>

<script lang="ts">
	import { Root as Button } from "$lib/components/ui/button";
	import * as Command from "$lib/components/ui/command";
	import * as Popover from "$lib/components/ui/popover";
	import { Root as ScrollArea } from "$lib/components/ui/scroll-area";
	import { CheckIcon, SelectorIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	import Flag from "./phone-input-flag.svelte";

	let {
		countries,
		disabled = false,
		selected = $bindable(null),
		onselect = undefined,
		order = (a, b) => {
			return a.name.localeCompare(b.name);
		}
	}: CountrySelectorProps = $props();

	let selectedCountry = $derived(countries.find((a) => a.iso2 == selected));
	let sortedCountries = $derived([...countries].sort(order));

	let open = $state(false);
	let selectedValue = $state(false);

	/** @param country - Country whose ISO code should become the selected value. */
	function selectCountry(country: Country) {
		selected = country.iso2;
		selectedValue = true;
		open = false;
		onselect?.(selected);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				data-slot="phone-input-country-trigger"
				type="button"
				variant="outline"
				class={cn("flex shrink-0 gap-1 rounded-l-lg rounded-r-none px-3")}
				{disabled}
			>
				<Flag country={selectedCountry} />
				<SelectorIcon class={cn("-mr-2 h-4 w-4 opacity-50", disabled ? "hidden" : "opacity-100")} />
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content
		data-slot="phone-input-country-content"
		class="w-[300px] p-0"
		align="start"
		onCloseAutoFocus={(e) => {
			if (selectedValue) {
				selectedValue = false;
				e.preventDefault();
			}
		}}
	>
		<Command.Root>
			<Command.Input placeholder="Search..." />

			<Command.List>
				<ScrollArea class="h-72">
					<Command.Empty>No country found.</Command.Empty>

					<Command.Group class="overflow-clip">
						{#each sortedCountries as country (country.id)}
							<Command.Item class="gap-2 [&_.cn-command-item-indicator]:hidden" value={country.name} onSelect={() => selectCountry(country)}>
								<Flag {country} />

								<span class="flex-1 text-sm">{country.name}</span>

								<span class="text-sm text-foreground/50">
									+{country.dialCode}
								</span>

								<div class="w-4">
									{#if country.iso2 == selected}
										<CheckIcon class="phone-input-check-icon size-4" />
									{/if}
								</div>
							</Command.Item>
						{/each}
					</Command.Group>
				</ScrollArea>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
