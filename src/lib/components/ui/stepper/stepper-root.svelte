<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type RootProps = {
		step?: number;
		children?: Snippet;
	};
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
