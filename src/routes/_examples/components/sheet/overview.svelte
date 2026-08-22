<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Input from "$lib/components/ui/input";
	import * as Label from "$lib/components/ui/label";
	import * as Sheet from "$lib/components/ui/sheet";
</script>

<Sheet.Root>
	<Sheet.Trigger class={Button.rootVariants({ variant: "outline" })}>Open profile settings</Sheet.Trigger>

	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Profile settings</Sheet.Title>
			<Sheet.Description>Update how your name appears to other people.</Sheet.Description>
		</Sheet.Header>

		<form id="profile-form" class="space-y-4 px-4">
			<div class="grid gap-2">
				<Label.Root for="sheet-display-name">Name</Label.Root>
				<Input.Root id="sheet-display-name" name="name" autocomplete="name" />
			</div>
		</form>

		<Sheet.Footer>
			<Button.Root type="submit" form="profile-form">Save changes</Button.Root>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
