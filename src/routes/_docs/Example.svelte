<script lang="ts">
	import type { Snippet } from "svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import SourceCode from "./SourceCode.svelte";

	let { title = "Interactive example", source, children }: { title?: string | undefined; source: string; children: Snippet } = $props();
</script>

<section class="my-10 scroll-mt-20" aria-labelledby="interactive-example">
	<div class="mb-4">
		<p class="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Live preview</p>
		<h2 id="interactive-example" class="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
	</div>

	<Tabs.Root value="preview">
		<Tabs.List>
			<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
			<Tabs.Trigger value="code">Code</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="preview" class="overflow-hidden rounded-lg border">
			<div class="flex min-h-40 w-full items-center justify-center">{@render children()}</div>
		</Tabs.Content>

		<Tabs.Content value="code" class="overflow-hidden rounded-lg border"><SourceCode {source} /></Tabs.Content>
	</Tabs.Root>
</section>
