<script lang="ts" module>
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	import * as Button from "$lib/components/ui/button";

	export type ActionProps = AlertDialogPrimitive.ActionProps & {
		variant?: Button.RootVariants | undefined;
		size?: Button.RootSizes | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "default", size = "default", ...restProps }: ActionProps = $props();
</script>

<AlertDialogPrimitive.Action
	bind:ref
	data-slot="alert-dialog-action"
	class={cn(Button.rootVariants({ variant, size }), "cn-alert-dialog-action", className)}
	{...restProps}
/>
