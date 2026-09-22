<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import * as Bubble from "$lib/components/ui/bubble";
	import * as Marker from "$lib/components/ui/marker";
	import * as Message from "$lib/components/ui/message";
</script>

<div class="mx-auto flex w-full max-w-sm flex-col gap-6">
	<Message.Root>
		<Message.Avatar>
			<Avatar.Root>
				<Avatar.Fallback>AI</Avatar.Fallback>
			</Avatar.Root>
		</Message.Avatar>

		<Message.Content>
			<Message.Header>Assistant</Message.Header>
			<Bubble.Root variant="muted">
				<Bubble.Content>I found three files that need to be updated.</Bubble.Content>
			</Bubble.Root>
		</Message.Content>
	</Message.Root>

	<Message.Root align="end">
		<Message.Avatar>
			<Avatar.Root>
				<Avatar.Fallback>ME</Avatar.Fallback>
			</Avatar.Root>
		</Message.Avatar>

		<Message.Content>
			<Bubble.Root>
				<Bubble.Content>Update them and run the checks.</Bubble.Content>
			</Bubble.Root>
			<Message.Footer>Delivered</Message.Footer>
		</Message.Content>
	</Message.Root>

	<Marker.Root role="status">
		<Marker.Content class="shimmer">Running checks...</Marker.Content>
	</Marker.Root>
</div>
