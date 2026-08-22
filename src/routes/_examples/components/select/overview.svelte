<script lang="ts">
	import * as Select from "$lib/components/ui/select";

	const themes = [
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
		{ value: "system", label: "System" }
	];

	let value = $state("");
	const triggerText = $derived(themes.find((theme) => theme.value === value)?.label ?? "Select a theme");
</script>

<Select.Root type="single" bind:value items={themes}>
	<Select.Trigger class="w-48" aria-label="Theme">{triggerText}</Select.Trigger>
	<Select.Content>
		{#each themes as theme (theme.value)}
			<Select.Item value={theme.value} label={theme.label}>{theme.label}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
