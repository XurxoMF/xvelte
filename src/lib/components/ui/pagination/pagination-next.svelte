<script lang="ts" module>
	import { Pagination as PaginationPrimitive } from "bits-ui";

	export type NextProps = PaginationPrimitive.NextButtonProps;
</script>

<script lang="ts">
	import { ChevronRightIcon } from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";
	import * as Button from "$lib/components/ui/button";

	let { ref = $bindable(null), class: className, ...restProps }: NextProps = $props();
</script>

<PaginationPrimitive.NextButton
	bind:ref
	data-slot="pagination-next"
	aria-label={m.vivid_pine_next()}
	class={cn(Button.rootVariants({ variant: "ghost", size: "icon" }), className)}
	{...restProps}
>
	<span class="sr-only">{m.young_elm_next()}</span>
	<ChevronRightIcon />
</PaginationPrimitive.NextButton>
