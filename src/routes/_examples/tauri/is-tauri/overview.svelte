<script lang="ts">
	import { isTauri } from "$lib/tauri/hooks/is-tauri";

	const runtime = isTauri();
</script>

<dl class="grid gap-4 sm:grid-cols-2">
	<div class="rounded-lg border bg-card p-4">
		<dt class="text-sm text-muted-foreground">Current runtime</dt>
		<dd class="mt-1 font-mono text-lg">{runtime}</dd>
	</div>

	<div class="rounded-lg border bg-card p-4">
		<dt class="text-sm text-muted-foreground">Tauri APIs available</dt>
		<dd class="mt-1 font-mono text-lg">{runtime === "tauri" ? "yes" : "no"}</dd>
	</div>
</dl>
