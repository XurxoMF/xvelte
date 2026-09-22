<script lang="ts">
	const messages = [
		"Design review at 09:30",
		"Upload assets before lunch",
		"Confirm the release notes",
		"Run the accessibility audit",
		"Publish the final build",
		"Archive the completed sprint"
	];

	const tags = ["Svelte", "Tailwind", "Accessibility", "Localization", "Testing", "Documentation", "Performance"];
</script>

<div class="grid gap-6 sm:grid-cols-2">
	<section aria-labelledby="vertical-fade-title">
		<h3 id="vertical-fade-title" class="mb-2 text-sm font-medium">Vertical fade</h3>
		<div class="h-40 scroll-fade-y overflow-y-auto rounded-lg border">
			<ul class="space-y-2 p-4">
				{#each messages as message (message)}
					<li class="rounded-md bg-muted px-3 py-2 text-sm">{message}</li>
				{/each}
			</ul>
		</div>
	</section>

	<section aria-labelledby="horizontal-fade-title">
		<h3 id="horizontal-fade-title" class="mb-2 text-sm font-medium">Horizontal fade</h3>
		<div class="scroll-fade-x overflow-x-auto rounded-lg border">
			<ul class="flex w-max gap-2 p-4">
				{#each tags as tag (tag)}
					<li class="rounded-full bg-muted px-4 py-2 text-sm whitespace-nowrap">{tag}</li>
				{/each}
			</ul>
		</div>
	</section>
</div>
