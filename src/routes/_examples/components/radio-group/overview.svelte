<script lang="ts">
	import * as Label from "$lib/components/ui/label";
	import * as RadioGroup from "$lib/components/ui/radio-group";

	let density = $state("comfortable");
</script>

<div class="grid gap-2">
	<p id="density-label" class="text-sm font-medium">Interface density</p>

	<RadioGroup.Root bind:value={density} aria-labelledby="density-label">
		<div class="flex items-center gap-2">
			<RadioGroup.Item id="density-default" value="default" />
			<Label.Root for="density-default">Default</Label.Root>
		</div>

		<div class="flex items-center gap-2">
			<RadioGroup.Item id="density-comfortable" value="comfortable" />
			<Label.Root for="density-comfortable">Comfortable</Label.Root>
		</div>

		<div class="flex items-center gap-2">
			<RadioGroup.Item id="density-compact" value="compact" />
			<Label.Root for="density-compact">Compact</Label.Root>
		</div>
	</RadioGroup.Root>

	<p class="text-sm text-muted-foreground">Selected: {density}</p>
</div>
