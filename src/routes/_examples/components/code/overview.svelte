<script lang="ts">
	import * as Code from "$lib/components/ui/code";

	const source = `function greet(name: string) {
	return \`Hello, \${name}!\`;
}`;
</script>

<Code.Root code={source} lang="typescript" />
