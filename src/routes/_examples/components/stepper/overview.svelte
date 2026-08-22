<script lang="ts">
	import * as Stepper from "$lib/components/ui/stepper";

	const steps = [
		{ title: "Account", description: "Your details" },
		{ title: "Plan", description: "Choose access" },
		{ title: "Review", description: "Confirm choices" }
	];

	let step = $state(1);
</script>

<Stepper.Root bind:step>
	<Stepper.Nav aria-label="Account setup progress" class="w-full justify-between px-4">
		{#each steps as item, index (item.title)}
			<Stepper.Item>
				<Stepper.Trigger class="flex w-[150px] flex-col items-center">
					<Stepper.Indicator>{index + 1}</Stepper.Indicator>

					<div class="flex flex-col">
						<Stepper.Title>{item.title}</Stepper.Title>
						<Stepper.Description>{item.description}</Stepper.Description>
					</div>
				</Stepper.Trigger>

				<Stepper.Separator aria-hidden="true" class="left-[75px]" />
			</Stepper.Item>
		{/each}
	</Stepper.Nav>

	<div class="my-6 rounded-lg border p-4">
		{#if step === 1}
			Account form
		{:else if step === 2}
			Plan selection
		{:else}
			Review and submit
		{/if}
	</div>

	<div class="flex justify-between">
		<Stepper.Previous>Previous</Stepper.Previous>
		<Stepper.Next>Next</Stepper.Next>
	</div>
</Stepper.Root>
