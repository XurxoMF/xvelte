<script lang="ts">
	import { AlertErrorIcon, CheckIcon, CircleIcon, LoaderIcon, SearchIcon } from "$lib/icons";

	import * as Trace from "$lib/components/ui/trace";
</script>

<Trace.Root class="mx-auto max-w-sm">
	<Trace.Line>
		<Trace.Icon><CheckIcon /></Trace.Icon>
		<Trace.Title>Loaded the project instructions</Trace.Title>
		<Trace.Description>0.2s</Trace.Description>
	</Trace.Line>

	<Trace.Collapsible open>
		<Trace.CollapsibleTrigger>
			<Trace.Line>
				<Trace.Icon><SearchIcon /></Trace.Icon>
				<Trace.Title>Inspected the component directory</Trace.Title>
				<Trace.Description>12 files</Trace.Description>
			</Trace.Line>
		</Trace.CollapsibleTrigger>

		<Trace.CollapsibleContent>
			<p>Found reusable primitives, component guides, and preview examples.</p>
		</Trace.CollapsibleContent>
	</Trace.Collapsible>

	<Trace.Line status="running">
		<Trace.Icon><LoaderIcon class="animate-spin" /></Trace.Icon>
		<Trace.Title>Validating the implementation</Trace.Title>
	</Trace.Line>

	<Trace.Line status="pending">
		<Trace.Icon><CircleIcon /></Trace.Icon>
		<Trace.Title>Preparing the final response</Trace.Title>
	</Trace.Line>

	<Trace.Line status="error">
		<Trace.Icon><AlertErrorIcon /></Trace.Icon>
		<Trace.Title>One optional check needs attention</Trace.Title>
	</Trace.Line>
</Trace.Root>
