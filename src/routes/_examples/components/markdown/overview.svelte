<script lang="ts">
	import { UseMarkdown } from "$lib/hooks/use-markdown.svelte";

	import * as Markdown from "$lib/components/ui/markdown";
	import * as Typography from "$lib/components/ui/typography";

	const markdown = new UseMarkdown(`# Release notes

A reusable document rendered with **xvelte components**.

> [!TIP]
> Wrap Markdown.Root in Typography.Prose for automatic document rhythm.

- [x] Parse CommonMark and GFM
- [x] Render semantic components
- [ ] Add the remaining dedicated renderers

\`\`\`ts
const markdown = new UseMarkdown(source);
\`\`\``);
</script>

<Typography.Prose>
	<Markdown.Root ast={markdown.current} />
</Typography.Prose>
