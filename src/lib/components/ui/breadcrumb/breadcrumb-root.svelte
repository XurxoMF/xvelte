<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	export type RootProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: RootProps = $props();
</script>

<nav bind:this={ref} data-slot="breadcrumb" aria-label={m.orchid_tern_breadcrumb()} class={className} {...restProps}>
	{@render children?.()}
</nav>
