<script lang="ts" module>
	import type { RatingGroupRootProps } from "bits-ui";

	export type RootProps = RatingGroupRootProps;
</script>

<script lang="ts">
	import { RatingGroup } from "bits-ui";

	import { cn } from "$lib/utils";

	let { value = $bindable(0), max = 5, orientation = "horizontal", class: className, ...restProps }: RootProps = $props();
</script>

<RatingGroup.Root
	data-slot="star-rating"
	class={cn("group flex w-fit place-items-center gap-1 rounded-md outline-hidden", className)}
	bind:value
	{max}
	{orientation}
	{...restProps}
/>
