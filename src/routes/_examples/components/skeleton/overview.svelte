<script lang="ts">
	import * as Skeleton from "$lib/components/ui/skeleton";
</script>

<div class="flex items-center gap-3" aria-hidden="true">
	<Skeleton.Root class="size-10 rounded-full" />
	<div class="space-y-2">
		<Skeleton.Root class="h-4 w-40" />
		<Skeleton.Root class="h-3 w-28" />
	</div>
</div>
