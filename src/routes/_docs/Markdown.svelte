<script lang="ts">
	import { UseMarkdown } from "$lib/hooks/use-markdown.svelte";
	import * as Markdown from "$lib/components/ui/markdown";
	import * as Typography from "$lib/components/ui/typography";

	let { source }: { source: string } = $props();

	const markdown = new UseMarkdown();

	$effect(() => {
		markdown.source = source;
	});
</script>

<Typography.Prose>
	<Markdown.Root ast={markdown.current} />
</Typography.Prose>
