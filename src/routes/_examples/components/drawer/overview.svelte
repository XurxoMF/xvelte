<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Drawer from "$lib/components/ui/drawer";
	import * as Input from "$lib/components/ui/input";
	import * as Label from "$lib/components/ui/label";

	let open = $state(false);
	let displayName = $state("Ada Lovelace");
</script>

<div class="flex items-center justify-center">
	<Drawer.Root bind:open>
		<Drawer.Trigger class={Button.rootVariants({ variant: "outline" })}>Edit profile</Drawer.Trigger>

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
				<Drawer.Close class={Button.rootVariants()}>Done</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
</div>
