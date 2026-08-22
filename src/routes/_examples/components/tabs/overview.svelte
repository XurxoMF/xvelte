<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";

	let value = $state("overview");
</script>

<Tabs.Root bind:value>
	<Tabs.List aria-label="Project sections">
		<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
		<Tabs.Trigger value="activity">Activity</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="overview" class="pt-4">Project summary and status.</Tabs.Content>
	<Tabs.Content value="activity" class="pt-4">Recent project events.</Tabs.Content>
</Tabs.Root>
