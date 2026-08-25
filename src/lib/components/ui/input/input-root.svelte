<script lang="ts" module>
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type RootTypes = Exclude<HTMLInputTypeAttribute, "file">;

	export type RootProps = WithElementRef<
		Omit<HTMLInputAttributes, "type"> & ({ type: "file"; files?: FileList | undefined } | { type?: RootTypes | undefined; files?: undefined })
	>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	}: RootProps = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40",
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-danger/50 dark:aria-invalid:ring-danger/40",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
