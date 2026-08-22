<script lang="ts">
	import { renderMarkdown } from "./markdown";

	let { source }: { source: string } = $props();
	let html = $derived(renderMarkdown(source));
</script>

<!-- The source is trusted, repository-owned Markdown rather than user input. -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<div class="docs-markdown">{@html html}</div>
