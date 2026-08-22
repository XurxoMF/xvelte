<script lang="ts">
	import * as InputGroup from "$lib/components/ui/input-group";
	import * as Label from "$lib/components/ui/label";

	let domain = $state("");
</script>

<div class="grid max-w-sm gap-1.5">
	<Label.Root for="website-domain">Website</Label.Root>

	<InputGroup.Root>
		<InputGroup.Addon>
			<InputGroup.Text>https://</InputGroup.Text>
		</InputGroup.Addon>

		<InputGroup.Input id="website-domain" name="domain" placeholder="example.com" bind:value={domain} />
	</InputGroup.Root>
</div>
