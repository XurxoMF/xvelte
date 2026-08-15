<script lang="ts" module>
	import * as Input from "$lib/components/ui/input";

	export type InputProps = Input.RootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), value = $bindable(), class: className, ...restProps }: InputProps = $props();
</script>

<Input.Root
	bind:ref
	data-slot="input-group-control"
	class={cn(
		"flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
		className
	)}
	bind:value
	{...restProps}
/>
