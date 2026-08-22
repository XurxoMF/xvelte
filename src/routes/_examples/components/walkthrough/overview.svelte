<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as Walkthrough from "$lib/components/ui/walkthrough";
	import type { Step } from "$lib/components/ui/walkthrough";

	let open = $state(false);

	const steps: Step[] = [
		{
			target: "project-navigation",
			title: "Project navigation",
			description: "Move between your project's main sections.",
			position: "right"
		},
		{
			target: "profile-settings",
			title: "Profile settings",
			description: "Update your name, language, and notification preferences.",
			position: "bottom"
		}
	];
</script>

<Button.Root onclick={() => (open = true)}>Start tour</Button.Root>

<nav id="project-navigation">...</nav>
<section id="profile-settings">...</section>

<Walkthrough.Root {steps} bind:open onComplete={() => console.info("Tour completed")} />
