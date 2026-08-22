<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Input from "$lib/components/ui/input";
	import * as Label from "$lib/components/ui/label";
	import * as Popover from "$lib/components/ui/popover";
</script>

<div class="flex items-center justify-center">
	<Popover.Root>
		<Popover.Trigger class={Button.rootVariants({ variant: "outline" })}>Change dimensions</Popover.Trigger>

		<Popover.Content aria-labelledby="dimensions-title" class="w-80">
			<Popover.Header>
				<Popover.Title id="dimensions-title">Dimensions</Popover.Title>
				<Popover.Description>Set the width and height for the selected layer.</Popover.Description>
			</Popover.Header>

			<div class="grid gap-2">
				<Label.Root for="layer-width">Width</Label.Root>
				<Input.Root id="layer-width" name="width" value="100%" />
			</div>

			<div class="grid gap-2">
				<Label.Root for="layer-height">Height</Label.Root>
				<Input.Root id="layer-height" name="height" value="320px" />
			</div>

			<Popover.Close class={Button.rootVariants()}>Apply</Popover.Close>
		</Popover.Content>
	</Popover.Root>
</div>
