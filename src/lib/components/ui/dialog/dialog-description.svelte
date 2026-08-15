<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";

	export type DescriptionProps = DialogPrimitive.DescriptionProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: DescriptionProps = $props();
</script>

<DialogPrimitive.Description
	bind:ref
	data-slot="dialog-description"
	class={cn("text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", className)}
	{...restProps}
/>
