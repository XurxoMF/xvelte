<script lang="ts" module>
	import type { RatingGroupItemProps } from "bits-ui";

	export type StarProps = Omit<RatingGroupItemProps, "index"> & {
		index: number;
		state: "active" | "partial" | "inactive";
	};
</script>

<script lang="ts">
	import { RatingGroup } from "bits-ui";

	import { cn } from "$lib/utils";
	import { StarHalfIcon, StarIcon } from "$lib/icons";

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
		<StarHalfIcon
			class={cn("absolute top-0 left-0 size-full fill-transparent transition-all group-data-[state=active]/item:fill-current", {
				"ltr:fill-current": state === "partial"
			})}
		/>
		<StarHalfIcon
			class={cn("absolute top-0 right-0 size-full scale-x-[-1] fill-transparent transition-all group-data-[state=active]/item:fill-current", {
				"rtl:fill-current": state === "partial"
			})}
		/>
	</div>
</RatingGroup.Item>
