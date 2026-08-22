<script lang="ts">
	import * as ColorPicker from "$lib/components/ui/color-picker";

	let color = $state("#7C3AED");
</script>

<div class="space-y-3">
	<ColorPicker.Root bind:value={color} />
	<p>Selected color: {color}</p>
</div>
