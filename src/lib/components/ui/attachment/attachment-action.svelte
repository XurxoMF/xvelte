<script lang="ts" module>
	import * as Button from "$lib/components/ui/button";

	/** Props for an Attachment action button. */
	export type ActionProps = Button.RootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, variant = "ghost", size = "icon-xs", ...restProps }: ActionProps = $props();
</script>

<Button.Root bind:ref data-slot="attachment-action" {variant} {size} class={cn(className)} {...restProps} />
