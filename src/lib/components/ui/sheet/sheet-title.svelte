<script lang="ts" module>
	import { Dialog as SheetPrimitive } from "bits-ui";

	export type TitleProps = SheetPrimitive.TitleProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: TitleProps = $props();
</script>

<SheetPrimitive.Title bind:ref data-slot="sheet-title" class={cn("text-base font-medium text-foreground", className)} {...restProps} />
