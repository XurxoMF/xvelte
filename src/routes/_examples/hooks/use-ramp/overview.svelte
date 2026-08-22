<script lang="ts">
	import { onDestroy } from "svelte";

	import { useRamp } from "$lib/hooks/use-ramp.svelte";

	let value = $state(0);
	const maximum = 100;

	const ramp = useRamp({
		increment: () => value++,
		canRamp: () => value < maximum
	});

	onDestroy(ramp.reset);
</script>

<button
	type="button"
	disabled={value >= maximum}
	onpointerdown={() => ramp.start()}
	onpointerup={ramp.reset}
	onpointercancel={ramp.reset}
	onpointerleave={ramp.reset}
>
	Increase continuously
</button>

<output aria-live="polite">{value}</output>
