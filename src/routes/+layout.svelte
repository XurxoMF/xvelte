<script lang="ts">
	import "./layout.css";

	import { ModeWatcher } from "mode-watcher";

	import * as Tooltip from "$lib/components/ui/tooltip";

	let { children } = $props();
</script>

<ModeWatcher />

<Tooltip.Provider delayDuration={500}>
	{@render children()}
</Tooltip.Provider>
