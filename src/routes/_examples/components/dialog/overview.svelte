<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Input from "$lib/components/ui/input";
	import * as Label from "$lib/components/ui/label";

	let open = $state(false);
	let displayName = $state("Ada Lovelace");

	function saveProfile() {
		console.info("Save profile", displayName);
		open = false;
	}
</script>

<div class="flex items-center justify-center">
	<Dialog.Root bind:open>
		<Dialog.Trigger class={Button.rootVariants({ variant: "outline" })}>Edit profile</Dialog.Trigger>

		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Edit profile</Dialog.Title>
				<Dialog.Description>Update the name displayed on your public profile.</Dialog.Description>
			</Dialog.Header>

			<div class="grid gap-2">
				<Label.Root for="dialog-display-name">Display name</Label.Root>
				<Input.Root id="dialog-display-name" name="displayName" autocomplete="name" bind:value={displayName} />
			</div>

			<Dialog.Footer>
				<Dialog.Close class={Button.rootVariants({ variant: "outline" })}>Cancel</Dialog.Close>
				<Button.Root onclick={saveProfile}>Save changes</Button.Root>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
