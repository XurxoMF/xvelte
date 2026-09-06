<script lang="ts">
	import CategoryPage from "../../_docs/CategoryPage.svelte";
	import { categories, tauri } from "../../_docs/catalog";

	let { data }: { data: { category: string } } = $props();

	let category = $derived(categories.find((category) => category.directory === data.category));
	let units = $derived(tauri.filter((unit) => unit.kind === category?.kind));
</script>

{#if category}
	<CategoryPage title={`Tauri ${category.label}`} description={`${category.label} available to SvelteKit applications embedded in Tauri.`} {units} />
{/if}
