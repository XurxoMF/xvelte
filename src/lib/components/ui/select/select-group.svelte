<script lang="ts" module>
	import { Select as SelectPrimitive } from "bits-ui";

	export type GroupProps = SelectPrimitive.GroupProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: GroupProps = $props();
</script>

<SelectPrimitive.Group bind:ref data-slot="select-group" class={cn("scroll-my-1 p-1", className)} {...restProps} />
