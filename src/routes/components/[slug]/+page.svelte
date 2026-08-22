<script lang="ts">
	import UnitPage from "../../_docs/UnitPage.svelte";
	let { data }: { data: { slug: string } } = $props();
</script>

<UnitPage kind="component" slug={data.slug} />
