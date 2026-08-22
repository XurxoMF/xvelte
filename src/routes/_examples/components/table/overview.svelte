<script lang="ts">
	import * as Table from "$lib/components/ui/table";

	const invoices = [
		{ id: "INV-001", status: "Paid", total: "€240.00" },
		{ id: "INV-002", status: "Pending", total: "€125.00" }
	];
</script>

<Table.Root>
	<Table.Caption>Recent invoices</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head scope="col">Invoice</Table.Head>
			<Table.Head scope="col">Status</Table.Head>
			<Table.Head scope="col" class="text-right">Total</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each invoices as invoice (invoice.id)}
			<Table.Row>
				<Table.Cell class="font-medium">{invoice.id}</Table.Cell>
				<Table.Cell>{invoice.status}</Table.Cell>
				<Table.Cell class="text-right">{invoice.total}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
