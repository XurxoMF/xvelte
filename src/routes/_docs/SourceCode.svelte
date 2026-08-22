<script lang="ts">
	import * as Code from "$lib/components/ui/code";

	let { source, lang = "svelte" }: { source: string; lang?: string | undefined } = $props();

	const loadLanguage = () => import("@shikijs/langs/svelte");
</script>

<Code.Root code={source} {lang} {loadLanguage} class="max-h-[34rem] rounded-none border-none">
	<Code.CopyButton tabindex={0} />
</Code.Root>
