<script lang="ts">
	import * as Label from "$lib/components/ui/label";
	import * as Textarea from "$lib/components/ui/textarea";

	let message = $state("");
</script>

<div class="grid gap-2">
	<Label.Root for="message">Message</Label.Root>
	<Textarea.Root id="message" name="message" bind:value={message} placeholder="Write your message" />
</div>
