<script lang="ts" module>
	import * as Button from "$lib/components/ui/button";

	export type TriggerProps = Button.RootProps & {
		onclick?: ((e: MouseEvent) => void) | undefined;
	};
</script>

<script lang="ts">
	import * as Sidebar from ".";

	import { SidebarIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import * as Tooltip from "$lib/components/ui/tooltip";

	let { ref = $bindable(null), class: className, onclick, ...restProps }: TriggerProps = $props();

	const sidebar = Sidebar.getSidebarContext();
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				{...props}
				bind:ref
				data-sidebar="trigger"
				data-slot="sidebar-trigger"
				variant="ghost"
				size="icon-sm"
				class={className}
				type="button"
				onclick={(e) => {
					onclick?.(e);
					sidebar.toggle();
				}}
				{...restProps}
			>
				<SidebarIcon />
				<span class="sr-only">{m.brisk_otter_turn()}</span>
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>

	<Tooltip.Content>
		<p>{m.brisk_otter_turn()}</p>
	</Tooltip.Content>
</Tooltip.Root>
