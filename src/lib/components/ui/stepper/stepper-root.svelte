<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type RootProps = {
		step?: number | undefined;
		orientation?: "horizontal" | "vertical" | undefined;
		children?: Snippet | undefined;
	};
</script>

<script lang="ts">
	import { setStepperContext } from "./stepper-context.svelte.js";

	let { step = $bindable(1), orientation = "horizontal", children }: RootProps = $props();

	setStepperContext(
		() => step,
		(value) => (step = value),
		() => orientation
	);
</script>

{@render children?.()}
