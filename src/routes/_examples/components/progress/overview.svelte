<script lang="ts">
	import * as Progress from "$lib/components/ui/progress";

	let value = $state(68);
</script>

<div class="grid max-w-md gap-2">
	<div class="flex items-center justify-between text-sm">
		<span id="upload-progress-label">Uploading files</span>
		<span>{value}%</span>
	</div>

	<Progress.Root {value} aria-labelledby="upload-progress-label" aria-valuetext={`${value}%`} />
</div>
