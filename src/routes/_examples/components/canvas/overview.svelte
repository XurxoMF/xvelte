<script lang="ts">
	import * as Canvas from "$lib/components/ui/canvas";
	import * as Typography from "$lib/components/ui/typography";
</script>

<div class="h-96 overflow-hidden rounded-lg border">
	<Canvas.Root snap={24}>
		<Canvas.Edge fromNode="discovery" toNode="design" type="smoothstep">
			{#snippet label()}Brief ready{/snippet}
		</Canvas.Edge>

		<Canvas.Edge fromNode="design" toNode="review" animated>
			{#snippet label()}In progress{/snippet}
		</Canvas.Edge>

		<Canvas.Edge fromNode="review" toNode="launch" type="straight" />

		<Canvas.Node id="discovery" x={48} y={48} class="w-52 rounded-lg border bg-popover p-4 shadow-sm">
			<Typography.H2>Discovery</Typography.H2>
			<Typography.P class="text-muted-foreground">Collect goals, constraints, and user needs.</Typography.P>
		</Canvas.Node>

		<Canvas.Node id="design" x={336} y={192} class="w-52 rounded-lg border bg-popover p-4 shadow-sm">
			<Typography.H2>Design</Typography.H2>
			<Typography.P class="text-muted-foreground">Shape the flow and prepare a focused prototype.</Typography.P>
		</Canvas.Node>

		<Canvas.Node id="review" x={624} y={48} class="w-52 rounded-lg border bg-popover p-4 shadow-sm">
			<Typography.H2>Review</Typography.H2>
			<Typography.P class="text-muted-foreground">Check accessibility, behavior, and final copy.</Typography.P>
		</Canvas.Node>

		<Canvas.Node id="launch" x={912} y={192} class="w-52 rounded-lg border bg-popover p-4 shadow-sm">
			<Typography.H2>Launch</Typography.H2>
			<Typography.P class="text-muted-foreground">Publish the update and monitor its impact.</Typography.P>
		</Canvas.Node>

		<Canvas.Controls />
		<Canvas.Minimap />
	</Canvas.Root>
</div>
