<script lang="ts" module>
	import { Pagination as PaginationPrimitive } from "bits-ui";

	export type PreviousProps = PaginationPrimitive.PrevButtonProps;
</script>

<script lang="ts">
	import { ChevronLeftIcon } from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";
	import * as Button from "$lib/components/ui/button";

	let { ref = $bindable(null), class: className, ...restProps }: PreviousProps = $props();
</script>

<PaginationPrimitive.PrevButton
	bind:ref
	data-slot="pagination-previous"
	aria-label={m.urban_deer_previous()}
	class={cn(Button.rootVariants({ variant: "ghost", size: "icon" }), className)}
	{...restProps}
>
	<ChevronLeftIcon />
	<span class="sr-only">{m.warm_koala_previous()}</span>
</PaginationPrimitive.PrevButton>
