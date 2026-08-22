<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Walkthrough from "$lib/components/ui/walkthrough";

	let open = $state(false);

	const steps: Walkthrough.Step[] = [
		{
			target: "sidebar-header",
			title: "Sidebar header",
			description: "Go to the main page by clicking here.",
			position: "right"
		},
		{
			target: "sidebar-footer",
			title: "Sidebar footer",
			description: "There's nothing to de here... just look at it.",
			position: "right"
		}
	];
</script>

<div class="flex items-center justify-center">
	<Walkthrough.Root {steps} bind:open onComplete={() => console.info("Tour completed")} />

	<Button.Root onclick={() => (open = true)}>Start tour</Button.Root>
</div>
