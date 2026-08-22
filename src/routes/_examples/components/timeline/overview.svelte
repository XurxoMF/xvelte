<script lang="ts">
	import * as Timeline from "$lib/components/ui/timeline";

	const events = [
		{ date: "12 August 2026", title: "Order placed", description: "We received your order." },
		{ date: "13 August 2026", title: "Order shipped", description: "The parcel left the warehouse." }
	];
</script>

<div class="flex items-center justify-center">
	<Timeline.Root role="list" aria-label="Order history">
		{#each events as event (event.title)}
			<Timeline.Item role="listitem">
				<Timeline.Separator aria-hidden="true" />
				<Timeline.Content>
					<Timeline.Date>{event.date}</Timeline.Date>
					<Timeline.Title>{event.title}</Timeline.Title>
					<Timeline.Description>{event.description}</Timeline.Description>
				</Timeline.Content>
			</Timeline.Item>
		{/each}
	</Timeline.Root>
</div>
