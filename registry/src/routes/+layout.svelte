<script lang="ts">
	import "./layout.css";

	import * as Tooltip from "$lib/components/ui/tooltip";

	let { children } = $props();
</script>

<Tooltip.Provider delayDuration={500}>
	{@render children()}
</Tooltip.Provider>
