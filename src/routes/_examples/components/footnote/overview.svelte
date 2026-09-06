<script lang="ts">
	import * as Footnote from "$lib/components/ui/footnote";
</script>

<p>
	The release includes a smaller client bundle<Footnote.Reference id="example-footnote-reference-1" href="#example-footnote-1" number={1} />.
</p>

<Footnote.Root class="mt-6">
	<Footnote.List>
		<Footnote.Item id="example-footnote-1">
			The reported size excludes source maps and development-only code.
			<Footnote.BackReference href="#example-footnote-reference-1" number={1} />
		</Footnote.Item>
	</Footnote.List>
</Footnote.Root>
