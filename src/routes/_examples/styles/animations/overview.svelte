<script lang="ts">
	let replay = $state(0);
</script>

<div class="mx-auto grid max-w-2xl gap-4">
	<div class="flex items-end justify-between gap-4">
		<div>
			<h3 class="font-medium">Composable animations</h3>
			<p class="text-sm text-muted-foreground">Combine a base animation, effects, and independent timing controls.</p>
		</div>

		<button
			type="button"
			class="h-8 shrink-0 rounded-md border bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
			onclick={() => replay++}
		>
			Replay
		</button>
	</div>

	<div class="grid gap-3 sm:grid-cols-3">
		<div class="grid min-h-36 content-start gap-4 overflow-hidden rounded-xl border bg-card p-4">
			<div>
				<p class="text-sm font-medium">Entrance</p>
				<p class="text-xs text-muted-foreground">Fade, zoom, and slide</p>
			</div>

			{#key replay}
				<div
					class="animate-in rounded-lg bg-primary/10 p-3 text-sm text-primary animation-duration-500 animation-ease-out fade-in-0 zoom-in-95 slide-in-from-bottom-4"
				>
					Ready to review
				</div>
			{/key}
		</div>

		<div class="grid min-h-36 content-start gap-4 overflow-hidden rounded-xl border bg-card p-4">
			<div>
				<p class="text-sm font-medium">Exit</p>
				<p class="text-xs text-muted-foreground">Delayed and persistent</p>
			</div>

			{#key replay}
				<div
					class="animate-out rounded-lg bg-muted p-3 text-sm animation-delay-500 animation-duration-500 animation-ease-in animation-fill-forwards fade-out-0 zoom-out-95 slide-out-to-top-4"
				>
					Closing shortly
				</div>
			{/key}
		</div>

		<div class="grid min-h-36 content-start gap-4 overflow-hidden rounded-xl border bg-card p-4">
			<div>
				<p class="text-sm font-medium">Loop</p>
				<p class="text-xs text-muted-foreground">One complete cycle</p>
			</div>

			<div class="animate-loop rounded-lg bg-muted p-3 text-sm animation-duration-1600 fade-loop-60 slide-loop-to-top-2 zoom-loop-105">
				Synchronizing
			</div>
		</div>
	</div>
</div>
