<script lang="ts" module>
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import type { WithElementRef, WithoutChildren } from "$lib/utils";

	export type RootProps = WithoutChildren<WithElementRef<HTMLTextareaAttributes>>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), value = $bindable(), class: className, "data-slot": dataSlot = "textarea", ...restProps }: RootProps = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		"flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40",
		className
	)}
	bind:value
	{...restProps}></textarea>
