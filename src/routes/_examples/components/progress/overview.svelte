<script lang="ts">
	import * as Progress from "$lib/components/ui/progress";

	let value = $state(5);

	setInterval(() => {
		if (value < 100) value++;
	}, 250);
</script>

<div class="flex w-full flex-col gap-4">
	<div class="flex items-center justify-between text-sm">
		<span id="upload-progress-label">Uploading files</span>
		<span>{value}%</span>
	</div>

	<Progress.Root {value} aria-labelledby="upload-progress-label" aria-valuetext={`${value}%`} />
</div>
