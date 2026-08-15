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
	data-slot="breadcrumb-ellipsis"
	role="presentation"
	aria-hidden="true"
	class={cn("flex size-5 items-center justify-center [&>svg]:size-4", className)}
	{...restProps}
>
	<EllipsisIcon />
	<span class="sr-only">{m.azure_beaver_more()}</span>
</span>
