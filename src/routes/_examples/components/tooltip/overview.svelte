<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip";
</script>

<div class="flex items-center justify-center">
	<Tooltip.Provider delayDuration={100}>
		<Tooltip.Root>
			<Tooltip.Trigger>Hover me!</Tooltip.Trigger>

			<Tooltip.Content>Some description!</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
</div>
