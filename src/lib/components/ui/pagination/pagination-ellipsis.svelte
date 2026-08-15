<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	export type EllipsisProps = WithoutChildren<WithElementRef<HTMLAttributes<HTMLSpanElement>>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import { EllipsisIcon } from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";

	let { ref = $bindable(null), class: className, ...restProps }: EllipsisProps = $props();
</script>

<span
	bind:this={ref}
	aria-hidden="true"
	data-slot="pagination-ellipsis"
	class={cn("flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4", className)}
	{...restProps}
>
	<EllipsisIcon />
	<span class="sr-only">{m.zesty_duck_pages()}</span>
</span>
