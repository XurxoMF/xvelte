<script lang="ts">
	import * as Button from "#lib/components/ui/button/index.ts";
	import * as Item from "#lib/components/ui/item/index.ts";
</script>

<Item.Root variant="outline">
	<Item.Content>
		<Item.Title>Deployment complete</Item.Title>
		<Item.Description>The production site is running version 2.4.0.</Item.Description>
	</Item.Content>

	<Item.Actions>
		<Button.Root variant="outline" size="sm">View details</Button.Root>
	</Item.Actions>
</Item.Root>
