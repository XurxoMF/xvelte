<script lang="ts" module>
	import * as Chart from ".";

	export type StyleProps = { id: string; config: Chart.ChartConfig };
</script>

<script lang="ts">
	let { id, config }: StyleProps = $props();

	// Only series with explicit colors need generated CSS custom properties.
	const colorConfig = $derived(config ? Object.entries(config).filter(([, config]) => config.theme || config.color) : null);

	// Build one selector per theme so each series variable follows its configured palette.
	const themeContents = $derived.by(() => {
		if (!colorConfig || !colorConfig.length) return;

		const themeContents = [];
		for (const [_theme, prefix] of Object.entries(Chart.THEMES)) {
			let content = `${prefix} [data-chart=${id}] {\n`;
			const color = colorConfig.map(([key, itemConfig]) => {
				const theme = _theme as keyof typeof itemConfig.theme;
				const color = itemConfig.theme?.[theme] || itemConfig.color;
				return color ? `\t--color-${key}: ${color};` : null;
			});

			content += color.join("\n") + "\n}";

			themeContents.push(content);
		}

		return themeContents.join("\n");
	});
</script>

{#if themeContents}
	{#key id}
		<svelte:element this={"style"} data-slot="chart-style">
			{themeContents}
		</svelte:element>
	{/key}
{/if}
