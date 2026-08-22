<script lang="ts">
	import * as Pagination from "$lib/components/ui/pagination";
	import * as Typography from "$lib/components/ui/typography";

	const count = 95;
	const perPage = 10;
	let page = $state(1);
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<Pagination.Root {count} {perPage} bind:page>
		{#snippet children({ pages, currentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.Previous />
				</Pagination.Item>

				{#each pages as pageItem (pageItem.key)}
					{#if pageItem.type === "ellipsis"}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link page={pageItem} isActive={currentPage === pageItem.value} />
						</Pagination.Item>
					{/if}
				{/each}

				<Pagination.Item>
					<Pagination.Next />
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>

	<Typography.P class="text-muted-foreground">
		Page {page} of {Math.ceil(count / perPage)}
	</Typography.P>
</div>
