<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as Textarea from "$lib/components/ui/textarea";

	let message = $state("");
</script>

<Field.Field>
	<Field.Label for="message">Message</Field.Label>

	<Textarea.Root id="message" name="message" bind:value={message} placeholder="Write your message" aria-describedby="message-description" />

	<Field.Description id="message-description">Share enough detail for us to understand your request.</Field.Description>
</Field.Field>
