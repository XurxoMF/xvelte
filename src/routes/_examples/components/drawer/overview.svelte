<script lang="ts">
	import { rootVariants as buttonVariants } from "$lib/components/ui/button";
	import * as Drawer from "$lib/components/ui/drawer";
	import * as Input from "$lib/components/ui/input";
	import * as Label from "$lib/components/ui/label";

	let open = $state(false);
	let displayName = $state("Ada Lovelace");
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger class={buttonVariants({ variant: "outline" })}>Edit profile</Drawer.Trigger>

	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Edit profile</Drawer.Title>
			<Drawer.Description>Update the name displayed on your public profile.</Drawer.Description>
		</Drawer.Header>

		<div class="grid gap-2 px-4">
			<Label.Root for="drawer-display-name">Display name</Label.Root>
			<Input.Root id="drawer-display-name" name="displayName" autocomplete="name" bind:value={displayName} />
		</div>

		<Drawer.Footer>
			<Drawer.Close class={buttonVariants()}>Done</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
