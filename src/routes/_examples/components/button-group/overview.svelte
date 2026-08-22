<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as ButtonGroup from "$lib/components/ui/button-group";
</script>

<div class="flex items-center justify-center">
	<ButtonGroup.Root aria-label="Document actions">
		<Button.Root variant="outline">Save</Button.Root>
		<Button.Root variant="outline">Preview</Button.Root>
		<Button.Root variant="outline">Publish</Button.Root>
	</ButtonGroup.Root>
</div>
