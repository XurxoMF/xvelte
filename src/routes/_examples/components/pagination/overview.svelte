<script lang="ts">
	import * as Pagination from "$lib/components/ui/pagination";

	const count = 95;
	const perPage = 10;
	let page = $state(1);
</script>

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

<p class="mt-4 text-center text-sm text-muted-foreground">
	Page {page} of {Math.ceil(count / perPage)}
</p>
