<script lang="ts" module>
	import type { Snippet } from "svelte";

	import type { UseRampOptions } from "$lib/hooks/use-ramp.svelte";

	export type RootProps = {
		value?: number | undefined;
		step?: number | undefined;
		min?: number | undefined;
		max?: number | undefined;
		rampSettings?: Omit<UseRampOptions, "increment" | "canRamp"> | undefined;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { setNumberFieldContext } from "./number-field-context.svelte.js";

	let {
		value = $bindable(0),
		step = 1,
		min,
		max,
		rampSettings = { startDelay: 400, rampUpTime: 0, minFrequency: 35, maxFrequency: 35 },
		children
	}: RootProps = $props();

	setNumberFieldContext({
		get value() {
			return value;
		},
		set value(next) {
			value = next;
		},
		get step() {
			return step;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get rampSettings() {
			return rampSettings;
		}
	});
</script>

{@render children?.()}
