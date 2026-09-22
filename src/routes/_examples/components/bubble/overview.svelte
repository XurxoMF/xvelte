<script lang="ts">
	import * as Bubble from "$lib/components/ui/bubble";
</script>

<div class="mx-auto flex w-full max-w-sm flex-col gap-8">
	<Bubble.Root variant="muted">
		<Bubble.Content>Did the accessibility review pass?</Bubble.Content>
	</Bubble.Root>

	<Bubble.Group>
		<Bubble.Root align="end">
			<Bubble.Content>Yes. I also fixed the two low-contrast focus states.</Bubble.Content>
		</Bubble.Root>

		<Bubble.Root align="end" variant="tinted">
			<Bubble.Content>The updated preview is ready.</Bubble.Content>
			<Bubble.Reactions role="img" aria-label="Reactions: thumbs up and party popper">
				<span>👍</span>
				<span>🎉</span>
			</Bubble.Reactions>
		</Bubble.Root>
	</Bubble.Group>

	<Bubble.Root variant="danger">
		<Bubble.Content>The deployment failed. Review the build log before retrying.</Bubble.Content>
	</Bubble.Root>
</div>
