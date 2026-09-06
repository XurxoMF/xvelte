<script lang="ts">
	import { UseMarkdown } from "$lib/hooks/use-markdown.svelte";

	import * as Markdown from "$lib/components/ui/markdown";
	import * as Typography from "$lib/components/ui/typography";

	const markdown = new UseMarkdown(`# Release notes

A reusable document rendered with **xvelte components**.[^renderer]

![xvelte icon][xvelte-icon]

[xvelte-icon]: /favicon.png "xvelte"

> [!TIP]
> Wrap Markdown.Root in Typography.Prose for automatic document rhythm.

- [x] Parse CommonMark and GFM
- [x] Render semantic components
- [x] Render images and footnotes
- [x] Sanitize raw HTML by default

<details open><summary>Raw HTML</summary><p onclick="alert('removed')">Safe elements remain; unsafe attributes are removed.</p></details>

[^renderer]: Markdown.Root collects this definition and adds a return link automatically.

\`\`\`ts
const markdown = new UseMarkdown(source);
\`\`\``);
</script>

<Typography.Prose>
	<Markdown.Root ast={markdown.current} />
</Typography.Prose>
