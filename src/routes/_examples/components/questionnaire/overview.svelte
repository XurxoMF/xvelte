<script lang="ts">
	import * as Questionnaire from "$lib/components/ui/questionnaire";

	const items = [
		{
			name: "priority",
			required: true,
			choices: [{ value: "quality" }, { value: "speed" }, { value: "balance" }]
		},
		{
			name: "updates",
			choices: [{ value: "progress" }, { value: "decisions" }, { value: "risks" }]
		}
	] as const;

	let submitted = $state(false);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
	}
</script>

<Questionnaire.Root class="mx-auto max-w-md" {items} shortcuts="letters" onSubmit={handleSubmit}>
	<Questionnaire.Progress />

	<Questionnaire.Item name="priority" required>
		<Questionnaire.Title>What matters most for this iteration?</Questionnaire.Title>
		<Questionnaire.Description>Choose one option or describe another priority.</Questionnaire.Description>

		<Questionnaire.Choices>
			<Questionnaire.Choice value="quality">
				<span class="font-medium">Quality</span>
				<Questionnaire.ChoiceDescription>Prefer stronger validation and broader test coverage.</Questionnaire.ChoiceDescription>
			</Questionnaire.Choice>
			<Questionnaire.Choice value="speed">
				<span class="font-medium">Speed</span>
				<Questionnaire.ChoiceDescription>Deliver the smallest useful change first.</Questionnaire.ChoiceDescription>
			</Questionnaire.Choice>
			<Questionnaire.Choice value="balance">
				<span class="font-medium">Balance both</span>
			</Questionnaire.Choice>
			<Questionnaire.Input aria-label="Another priority" placeholder="Describe another priority…" />
		</Questionnaire.Choices>

		<Questionnaire.Error />
	</Questionnaire.Item>

	<Questionnaire.Item name="updates" multiple>
		<Questionnaire.Title>Which updates should be included?</Questionnaire.Title>
		<Questionnaire.Description>Select all that apply, or skip this question.</Questionnaire.Description>

		<Questionnaire.Choices>
			<Questionnaire.Choice value="progress">Progress</Questionnaire.Choice>
			<Questionnaire.Choice value="decisions">Decisions</Questionnaire.Choice>
			<Questionnaire.Choice value="risks">Risks</Questionnaire.Choice>
		</Questionnaire.Choices>

		<Questionnaire.Error />
	</Questionnaire.Item>

	<Questionnaire.Actions>
		<Questionnaire.Previous />
		<Questionnaire.Skip />
		<Questionnaire.Next />
		<Questionnaire.Submit>Save answers</Questionnaire.Submit>
	</Questionnaire.Actions>
</Questionnaire.Root>

{#if submitted}
	<p class="mt-4 text-center text-sm text-muted-foreground" role="status">Answers saved.</p>
{/if}
