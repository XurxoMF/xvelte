<script lang="ts">
	import { BarChart } from "layerchart";

	import * as Chart from "$lib/components/ui/chart";
	import * as Typography from "$lib/components/ui/typography";

	const chartData = [
		{ month: "January", desktop: 186, mobile: 80 },
		{ month: "February", desktop: 305, mobile: 200 },
		{ month: "March", desktop: 237, mobile: 120 },
		{ month: "April", desktop: 73, mobile: 190 },
		{ month: "May", desktop: 209, mobile: 130 },
		{ month: "June", desktop: 214, mobile: 140 }
	];

	const chartConfig = {
		desktop: {
			label: "Desktop",
			color: "var(--chart-1)"
		},
		mobile: {
			label: "Mobile",
			color: "var(--chart-2)"
		}
	} satisfies Chart.ChartConfig;

	const series = [
		{ key: "desktop", label: chartConfig.desktop.label, color: "var(--color-desktop)" },
		{ key: "mobile", label: chartConfig.mobile.label, color: "var(--color-mobile)" }
	];
</script>

<figure class="w-full">
	<figcaption class="mb-3">
		<Typography.H2>Visitors by device</Typography.H2>
		<Typography.P class="text-muted-foreground">Monthly visitors during the first half of the year.</Typography.P>
	</figcaption>

	<Chart.Container config={chartConfig} class="min-h-64 w-full">
		<BarChart data={chartData} x="month" axis="x" seriesLayout="group" {series} legend>
			{#snippet tooltip()}
				<Chart.Tooltip />
			{/snippet}
		</BarChart>
	</Chart.Container>
</figure>
