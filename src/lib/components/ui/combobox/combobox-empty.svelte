<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type EmptyProps = {
		class?: string | undefined;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	import * as Command from "$lib/components/ui/command";

	let { class: className, children }: EmptyProps = $props();
</script>

<Command.Empty data-slot="combobox-empty" class={cn(className)}>{@render children()}</Command.Empty>
