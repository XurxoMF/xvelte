<script lang="ts" module>
	import { Dialog as DialogPrimitive } from "bits-ui";

	export type TitleProps = DialogPrimitive.TitleProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: TitleProps = $props();
</script>

<DialogPrimitive.Title bind:ref data-slot="dialog-title" class={cn("text-base leading-none font-medium", className)} {...restProps} />
