<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Input from "$lib/components/ui/input";
	import * as Label from "$lib/components/ui/label";

	let email = $state("");
</script>

<form class="grid max-w-sm gap-2">
	<Label.Root for="account-email">Email address</Label.Root>
	<Input.Root id="account-email" name="email" type="email" autocomplete="email" placeholder="name@example.com" bind:value={email} required />

	<Button.Root type="submit">Continue</Button.Root>
</form>
