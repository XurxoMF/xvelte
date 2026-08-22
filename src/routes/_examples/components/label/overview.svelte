<script lang="ts">
	import * as Input from "$lib/components/ui/input";
	import * as Label from "$lib/components/ui/label";
</script>

<div class="grid gap-2">
	<Label.Root for="display-name">Display name</Label.Root>
	<Input.Root id="display-name" name="displayName" autocomplete="name" />
</div>
