<script lang="ts">
	import type { Snippet } from "svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import * as Typography from "$lib/components/ui/typography";
	import SourceCode from "./SourceCode.svelte";

	let { title = "Interactive example", source, children }: { title?: string | undefined; source: string; children: Snippet } = $props();
</script>

<section class="my-10 scroll-mt-20" aria-labelledby="interactive-example">
	<div class="mb-4">
		<Typography.P class="text-primary">Live preview</Typography.P>
		<Typography.H2 id="interactive-example">{title}</Typography.H2>
	</div>

	<Tabs.Root value="preview">
		<Tabs.List>
			<Tabs.Trigger value="preview">Preview</Tabs.Trigger>
			<Tabs.Trigger value="code">Code</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="preview" class="w-full border p-8">
			{@render children()}
		</Tabs.Content>

		<Tabs.Content value="code" class="w-full overflow-hidden border">
			<SourceCode {source} />
		</Tabs.Content>
	</Tabs.Root>
</section>
