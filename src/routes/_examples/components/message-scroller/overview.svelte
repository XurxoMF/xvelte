<script lang="ts">
	import * as Bubble from "$lib/components/ui/bubble";
	import * as Message from "$lib/components/ui/message";
	import * as MessageScroller from "$lib/components/ui/message-scroller";
</script>

<div class="mx-auto h-80 w-full max-w-sm overflow-hidden rounded-xl border bg-background">
	<MessageScroller.Provider defaultScrollPosition="start">
		<MessageScroller.Root>
			<MessageScroller.Viewport>
				<MessageScroller.Content class="gap-6 p-4">
					<MessageScroller.Item messageId="welcome">
						<Message.Root>
							<Message.Content>
								<Message.Header>Assistant</Message.Header>
								<Bubble.Root variant="muted">
									<Bubble.Content>What would you like to work on today?</Bubble.Content>
								</Bubble.Root>
							</Message.Content>
						</Message.Root>
					</MessageScroller.Item>

					<MessageScroller.Item messageId="request" scrollAnchor>
						<Message.Root align="end">
							<Message.Content>
								<Bubble.Root>
									<Bubble.Content>Review the conversation components and add the missing one.</Bubble.Content>
								</Bubble.Root>
							</Message.Content>
						</Message.Root>
					</MessageScroller.Item>

					<MessageScroller.Item messageId="analysis">
						<Message.Root>
							<Message.Content>
								<Message.Header>Assistant</Message.Header>
								<Bubble.Root variant="muted">
									<Bubble.Content>I found a transcript scroller designed for streamed responses and long histories.</Bubble.Content>
								</Bubble.Root>
							</Message.Content>
						</Message.Root>
					</MessageScroller.Item>

					<MessageScroller.Item messageId="follow-up" scrollAnchor>
						<Message.Root align="end">
							<Message.Content>
								<Bubble.Root>
									<Bubble.Content>Make sure loading older messages does not move the reader.</Bubble.Content>
								</Bubble.Root>
							</Message.Content>
						</Message.Root>
					</MessageScroller.Item>

					<MessageScroller.Item messageId="answer">
						<Message.Root>
							<Message.Content>
								<Message.Header>Assistant</Message.Header>
								<Bubble.Root variant="muted">
									<Bubble.Content>The visible row stays anchored while earlier history is inserted above it.</Bubble.Content>
								</Bubble.Root>
							</Message.Content>
						</Message.Root>
					</MessageScroller.Item>
				</MessageScroller.Content>
			</MessageScroller.Viewport>

			<MessageScroller.Button />
		</MessageScroller.Root>
	</MessageScroller.Provider>
</div>
