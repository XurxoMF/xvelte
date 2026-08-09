<script lang="ts" module>
	import type { StepperRootProps } from "./types";

	export type RootProps = StepperRootProps;
</script>

<script lang="ts">
	import { box } from "svelte-toolbelt";

	import { useStepperRoot } from "./stepper.svelte.js";

	let { step = $bindable(1), children }: RootProps = $props();

	useStepperRoot({
		step: box.with(
			() => step,
			(v) => (step = v)
		)
	});
</script>

{@render children?.()}
