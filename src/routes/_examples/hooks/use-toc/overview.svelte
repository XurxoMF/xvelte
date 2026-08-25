<script lang="ts">
	import { UseToc } from "$lib/hooks/use-toc.svelte";

	import * as TableOfContents from "$lib/components/ui/table-of-contents";
	import * as Typography from "$lib/components/ui/typography";

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
		<Typography.H1 id="overview">Overview</Typography.H1>
		<Typography.P>Introduction.</Typography.P>
		<Typography.H2 id="installation">Installation</Typography.H2>
		<Typography.P>Installation instructions.</Typography.P>
	</article>
</div>
