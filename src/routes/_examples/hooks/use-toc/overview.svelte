<script lang="ts">
	import * as TableOfContents from "$lib/components/ui/table-of-contents";
	import { UseToc } from "$lib/hooks/use-toc.svelte";

	const headings = new UseToc();
	let article = $state<HTMLElement>();

	$effect(() => {
		headings.ref = article;
		return () => headings.destroy();
	});
</script>

<div class="grid gap-8 lg:grid-cols-[14rem_1fr]">
	<nav aria-label="On this page">
		<TableOfContents.Root toc={headings.current} />
	</nav>

	<article bind:this={article}>
		<h1 id="overview">Overview</h1>
		<p>Introduction.</p>
		<h2 id="installation">Installation</h2>
		<p>Installation instructions.</p>
	</article>
</div>
