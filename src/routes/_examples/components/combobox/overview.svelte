<script lang="ts">
	import * as Combobox from "$lib/components/ui/combobox";

	const frameworks = [
		{ value: "sveltekit", label: "SvelteKit" },
		{ value: "astro", label: "Astro" },
		{ value: "nuxt", label: "Nuxt" },
		{ value: "next", label: "Next.js" }
	];

	let framework = $state("");
	let frameworkLabel = $derived(frameworks.find((item) => item.value === framework)?.label ?? "Select a framework");
</script>

<Combobox.Root bind:value={framework}>
	<Combobox.Trigger>{frameworkLabel}</Combobox.Trigger>

	<Combobox.Content>
		<Combobox.Input placeholder="Search frameworks..." />
		<Combobox.Empty>No framework found.</Combobox.Empty>

		<Combobox.List>
			<Combobox.Group heading="Frameworks">
				{#each frameworks as item (item.value)}
					<Combobox.Item value={item.value}>{item.label}</Combobox.Item>
				{/each}
			</Combobox.Group>
		</Combobox.List>
	</Combobox.Content>
</Combobox.Root>
