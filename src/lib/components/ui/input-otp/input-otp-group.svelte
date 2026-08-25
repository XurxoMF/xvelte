<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type GroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, children, ...restProps }: GroupProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-otp-group"
	class={cn(
		"flex items-center rounded-lg has-aria-invalid:border-danger has-aria-invalid:ring-3 has-aria-invalid:ring-danger/20 dark:has-aria-invalid:ring-danger/40",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
