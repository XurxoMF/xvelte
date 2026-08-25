<script lang="ts" module>
	import { Pagination as PaginationPrimitive } from "bits-ui";

	export type RootProps = PaginationPrimitive.RootProps;
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, count = 0, perPage = 10, page = $bindable(1), siblingCount = 1, ...restProps }: RootProps = $props();
</script>

<PaginationPrimitive.Root
	bind:ref
	bind:page
	role="navigation"
	aria-label={m.tidy_robin_pages()}
	data-slot="pagination"
	{count}
	{perPage}
	{siblingCount}
	class={cn("mx-auto flex w-full justify-center", className)}
	{...restProps}
/>
