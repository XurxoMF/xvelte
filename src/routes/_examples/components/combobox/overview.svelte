<script lang="ts">
	import * as Combobox from "$lib/components/ui/combobox";
	import * as Field from "$lib/components/ui/field";

	const frameworks = [
		{ value: "sveltekit", label: "SvelteKit" },
		{ value: "astro", label: "Astro" },
		{ value: "nuxt", label: "Nuxt" },
		{ value: "next", label: "Next.js" }
	];

	let framework = $state("");
	let frameworkLabel = $derived(frameworks.find((item) => item.value === framework)?.label ?? "Select a framework");
</script>

<Field.Field>
	<Field.Label for="project-framework">Framework</Field.Label>

	<Combobox.Root bind:value={framework}>
		<Combobox.Trigger id="project-framework" aria-describedby="project-framework-description">{frameworkLabel}</Combobox.Trigger>

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

	<Field.Description id="project-framework-description">Choose the framework used by this project.</Field.Description>
</Field.Field>
