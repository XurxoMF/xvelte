<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type ListProps = {
		class?: string | undefined;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import * as Command from "$lib/components/ui/command";

	let { class: className, children }: ListProps = $props();
</script>

<Command.List class={cn("w-full scroll-my-1", className)}>
	{@render children()}
</Command.List>
