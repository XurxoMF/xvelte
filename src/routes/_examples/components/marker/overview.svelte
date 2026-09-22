<script lang="ts">
	import { SearchIcon } from "$lib/icons";

	import * as Marker from "$lib/components/ui/marker";
	import * as Spinner from "$lib/components/ui/spinner";
</script>

<div class="mx-auto flex w-full max-w-sm flex-col gap-6">
	<Marker.Root role="status">
		<Marker.Icon>
			<Spinner.Root />
		</Marker.Icon>
		<Marker.Content class="shimmer">Checking the project files...</Marker.Content>
	</Marker.Root>

	<Marker.Root>
		<Marker.Icon>
			<SearchIcon />
		</Marker.Icon>
		<Marker.Content>Reviewed 12 related files</Marker.Content>
	</Marker.Root>

	<Marker.Root variant="separator">
		<Marker.Content>Today</Marker.Content>
	</Marker.Root>

	<Marker.Root variant="border">
		<Marker.Content>Conversation compacted</Marker.Content>
	</Marker.Root>
</div>
