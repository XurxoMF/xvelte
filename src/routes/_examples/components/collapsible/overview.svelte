<script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible";
	import * as Button from "$lib/components/ui/button";

	import { ChevronDownIcon } from "$lib/icons";
</script>

<div class="flex items-center justify-center">
	<Collapsible.Root class="w-90 space-y-2">
		<div class="flex items-center justify-between gap-4">
			<h4 class="text-sm font-semibold">Really cool collapsible</h4>

			<Collapsible.Trigger class={Button.rootVariants({ variant: "ghost", size: "icon-sm" })}>
				<ChevronDownIcon />
				<span class="sr-only">Toggle</span>
			</Collapsible.Trigger>
		</div>

		<Collapsible.Content class="space-y-2">
			<div class="rounded-md border px-4 py-3 font-mono text-sm">Item 1</div>
			<div class="rounded-md border px-4 py-3 font-mono text-sm">Item 2</div>
		</Collapsible.Content>
	</Collapsible.Root>
</div>
