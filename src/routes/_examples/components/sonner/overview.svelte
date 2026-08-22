<script lang="ts">
	import { ModeWatcher } from "mode-watcher";

	import * as Sonner from "$lib/components/ui/sonner";

	let { children } = $props();
</script>

<ModeWatcher />
<Sonner.Root />

{@render children()}
