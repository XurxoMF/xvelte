<script lang="ts">
	import UnitPage from "../../../_docs/UnitPage.svelte";

	let { data }: { data: { category: string; slug: string } } = $props();
</script>

<UnitPage href={`/tauri/${data.category}/${data.slug}`} />
