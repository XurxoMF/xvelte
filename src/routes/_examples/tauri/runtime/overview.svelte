<script lang="ts">
	import { getRuntime, isTauriRuntime } from "$lib/tauri/runtime";

	const runtime = getRuntime();
</script>

<dl class="grid gap-4 sm:grid-cols-2">
	<div class="rounded-lg border bg-card p-4">
		<dt class="text-sm text-muted-foreground">Current runtime</dt>
		<dd class="mt-1 font-mono text-lg">{runtime}</dd>
	</div>

	<div class="rounded-lg border bg-card p-4">
		<dt class="text-sm text-muted-foreground">Tauri APIs available</dt>
		<dd class="mt-1 font-mono text-lg">{isTauriRuntime() ? "yes" : "no"}</dd>
	</div>
</dl>
