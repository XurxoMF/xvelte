<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	import * as Button from "$lib/components/ui/button";

	export type CancelProps = AlertDialogPrimitive.CancelProps & {
		variant?: Button.RootVariants | undefined;
		size?: Button.RootSizes | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "outline", size = "default", ...restProps }: CancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel bind:ref data-slot="alert-dialog-cancel" class={cn(Button.rootVariants({ variant, size }), className)} {...restProps} />
