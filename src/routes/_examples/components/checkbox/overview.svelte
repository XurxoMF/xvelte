<script lang="ts">
	import * as Checkbox from "$lib/components/ui/checkbox";
	import * as Label from "$lib/components/ui/label";

	let accepted = $state(false);
</script>

<div class="flex items-center gap-2">
	<Checkbox.Root id="terms" name="terms" required bind:checked={accepted} />
	<Label.Root for="terms">Accept the terms and conditions</Label.Root>
</div>

<p class="mt-2 text-sm text-muted-foreground">
	{accepted ? "Terms accepted" : "Terms not accepted"}
</p>
