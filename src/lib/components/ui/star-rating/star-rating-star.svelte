<script lang="ts" module>
	import type { RatingGroupItemProps } from "bits-ui";

	export type StarProps = Omit<RatingGroupItemProps, "index"> & {
		index: number;
		state: "active" | "partial" | "inactive";
	};
</script>

<script lang="ts">
	import { RatingGroup } from "bits-ui";

	import { StarIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

	let { index, state, class: className, ...restProps }: StarProps = $props();
</script>

<RatingGroup.Item
	{index}
	data-slot="star-rating-star"
	class={cn("group/item size-5 rounded-md text-primary group-aria-disabled:opacity-50", className)}
	{...restProps}
>
	<div class="relative size-full">
		<StarIcon
			class={cn("size-full fill-transparent transition-all", {
				"fill-current": state === "active"
			})}
		/>
		{#if state === "partial"}
			<StarIcon
				aria-hidden="true"
				class="absolute inset-0 size-full fill-current stroke-transparent [clip-path:inset(0_50%_0_0)] rtl:[clip-path:inset(0_0_0_50%)]"
			/>
		{/if}
	</div>
</RatingGroup.Item>
