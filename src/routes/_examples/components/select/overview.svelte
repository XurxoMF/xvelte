<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as Select from "$lib/components/ui/select";

	const themes = [
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
		{ value: "system", label: "System" }
	];

	let value = $state("");
	const triggerText = $derived(themes.find((theme) => theme.value === value)?.label ?? "Select a theme");
</script>

<Field.Field>
	<Field.Label for="interface-theme">Theme</Field.Label>

	<Select.Root type="single" bind:value items={themes}>
		<Select.Trigger id="interface-theme" aria-describedby="interface-theme-description">{triggerText}</Select.Trigger>

		<Select.Content>
			<Select.Group>
				{#each themes as theme (theme.value)}
					<Select.Item value={theme.value} label={theme.label}>{theme.label}</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>

	<Field.Description id="interface-theme-description">Choose how the interface should appear.</Field.Description>
</Field.Field>
