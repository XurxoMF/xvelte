<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as Input from "$lib/components/ui/input";
	import * as Label from "$lib/components/ui/label";
</script>

<Field.Field>
	<!-- You can also use <Field.Label> as it's the same exact component -->
	<Label.Root for="display-name">Display name</Label.Root>

	<Input.Root id="display-name" name="displayName" autocomplete="name" aria-describedby="display-name-description" />

	<Field.Description id="display-name-description">Enter the name shown on your public profile.</Field.Description>
</Field.Field>
