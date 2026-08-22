<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion";
	import * as Typography from "$lib/components/ui/typography";
</script>

<Accordion.Root type="single">
	<Accordion.Item value="shipping">
		<Accordion.Trigger>How long does shipping take?</Accordion.Trigger>
		<Accordion.Content>
			<Typography.P>Standard shipping normally takes three to five working days.</Typography.P>
		</Accordion.Content>
	</Accordion.Item>

	<Accordion.Item value="returns">
		<Accordion.Trigger>Can I return an order?</Accordion.Trigger>
		<Accordion.Content>
			<Typography.P>Unused items can be returned within 30 days.</Typography.P>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
