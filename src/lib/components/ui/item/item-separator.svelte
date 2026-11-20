<script lang="ts" module>
	import * as Separator from "#lib/components/ui/separator/index.ts";

	export type SeparatorProps = Separator.RootProps;
</script>

<script lang="ts">
	import { cn } from "#lib/utils.ts";

	let { ref = $bindable(null), class: className, ...restProps }: SeparatorProps = $props();
</script>

<Separator.Root bind:ref data-slot="item-separator" orientation="horizontal" class={cn("my-2", className)} {...restProps} />
