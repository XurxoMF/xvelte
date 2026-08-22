<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as StarRating from "$lib/components/ui/star-rating";

	let rating = $state(3);
</script>

<Field.Field>
	<Field.Title id="rating-label">Your rating</Field.Title>

	<StarRating.Root bind:value={rating} aria-labelledby="rating-label" aria-describedby="rating-description">
		{#snippet children({ items })}
			{#each items as { index, state } (index)}
				<StarRating.Star {index} {state} />
			{/each}
		{/snippet}
	</StarRating.Root>

	<Field.Description id="rating-description">Selected rating: {rating} out of 5.</Field.Description>
</Field.Field>
