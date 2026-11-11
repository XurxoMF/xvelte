<script lang="ts">
	import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte";

	import * as CodeBlock from "$lib/components/ui/code-block";
	import * as Select from "$lib/components/ui/select";

	type Language = "typescript" | "svelte" | "python";

	const languages: { value: Language; label: string; code: string }[] = [
		{
			value: "typescript",
			label: "TypeScript",
			code: `type Release = {
	version: string;
	stable: boolean;
};

const current: Release = {
	version: "2.1.0",
	stable: true
};`
		},
		{
			value: "svelte",
			label: "Svelte",
			code: `<script lang="ts">
	let count = $state(0);
<${"/"}script>

<button onclick={() => count++}>
	Count: {count}
</button>`
		},
		{
			value: "python",
			label: "Python",
			code: `def release(version: str) -> dict[str, object]:
	return {
		"version": version,
		"stable": True,
	}`
		}
	];

	let language = $state<Language>("typescript");
	let selectedLanguage = $derived(languages.find((item) => item.value === language) ?? languages[0]);
	let source = $derived(selectedLanguage.code);
	const highlighted = useHighlightedCode(
		() => source,
		() => language
	);
</script>

<div class="mx-auto grid max-w-2xl gap-3">
	<div class="flex items-center justify-between gap-4">
		<div>
			<h3 class="font-medium">Lazy syntax highlighting</h3>
			<p class="text-sm text-muted-foreground">Change language to load another bundled Shiki grammar.</p>
		</div>

		<div class="grid gap-1 text-xs font-medium text-muted-foreground">
			<span id="highlight-language-label">Language</span>

			<Select.Root type="single" bind:value={language} items={languages}>
				<Select.Trigger size="sm" aria-labelledby="highlight-language-label" class="w-36">{selectedLanguage.label}</Select.Trigger>

				<Select.Content>
					{#each languages as item (item.value)}
						<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<CodeBlock.Root>
		<CodeBlock.Header>
			<CodeBlock.Title>{selectedLanguage.label}</CodeBlock.Title>
			<CodeBlock.Actions>
				<CodeBlock.CopyButton value={source} />
			</CodeBlock.Actions>
		</CodeBlock.Header>

		<CodeBlock.Content lineNumbers>
			{#each highlighted.current as line, index (index)}
				<CodeBlock.Line code={line} />
			{/each}
		</CodeBlock.Content>
	</CodeBlock.Root>
</div>
