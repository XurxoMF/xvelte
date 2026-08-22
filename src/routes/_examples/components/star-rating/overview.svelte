<script lang="ts">
	import * as StarRating from "$lib/components/ui/star-rating";

	let rating = $state(3);
</script>

<div>
	<p id="rating-label">Your rating: {rating} out of 5</p>

	<StarRating.Root bind:value={rating} aria-labelledby="rating-label">
		{#snippet children({ items })}
			{#each items as { index, state } (index)}
				<StarRating.Star {index} {state} />
			{/each}
		{/snippet}
	</StarRating.Root>
</div>
