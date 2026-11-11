<script lang="ts">
	import { animateInView } from "$lib/attachments/animate-in-view";

	let scroller = $state<HTMLElement>();
</script>

<section aria-labelledby="animate-in-view-overview-title" class="mx-auto max-w-xl">
	<div class="mb-3 flex items-end justify-between gap-4">
		<div>
			<h3 id="animate-in-view-overview-title" class="font-medium">Scroll-driven release</h3>
			<p class="text-sm text-muted-foreground">The timeline follows the current scroll position in either direction.</p>
		</div>

		<span class="shrink-0 text-xs text-muted-foreground">GSAP timeline</span>
	</div>

	<div bind:this={scroller} class="h-96 overflow-x-clip overflow-y-auto overscroll-contain rounded-xl border bg-muted/20">
		<div class="px-5 py-100">
			<article
				{@attach animateInView({
					scrollTrigger: {
						scroller,
						start: "top 85%",
						end: "bottom 60%",
						scrub: 0.4
					},
					timeline: (timeline, { select }) => {
						timeline
							.fromTo(select("[data-card]"), { autoAlpha: 0, x: 48, rotate: 2 }, { autoAlpha: 1, x: 0, rotate: 0, duration: 0.35 })
							.fromTo(select("[data-progress]"), { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 0.65 }, 0.35)
							.fromTo(select("[data-status]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.8);
					}
				})}
			>
				<div data-card class="overflow-hidden rounded-xl border bg-card shadow-sm">
					<div class="h-1 origin-left bg-primary" data-progress></div>

					<div class="p-5">
						<div class="flex items-start justify-between gap-4">
							<div>
								<p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">Release 2.1</p>
								<h4 class="mt-1 font-medium text-card-foreground">Animation system ready</h4>
							</div>

							<span data-status class="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Complete</span>
						</div>

						<p class="mt-3 text-sm text-muted-foreground">
							Scroll back and forth to scrub opacity, position, rotation, progress, and status through one custom timeline.
						</p>
					</div>
				</div>
			</article>
		</div>
	</div>
</section>
