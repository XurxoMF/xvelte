<script lang="ts">
	import * as Badge from "$lib/components/ui/badge";
</script>

<div class="flex flex-wrap items-center justify-center gap-2">
	<Badge.Root variant="default">Default</Badge.Root>
	<Badge.Root variant="secondary">Secondary</Badge.Root>
	<Badge.Root variant="destructive">Destructive</Badge.Root>
	<Badge.Root variant="outline">Outline</Badge.Root>
	<Badge.Root variant="ghost">Ghost</Badge.Root>
	<Badge.Root variant="link" href="#">Link</Badge.Root>
</div>
