<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type PreferencesProps = WithoutChildren<ButtonProps> & {
		tooltipLabel?: string;
	};
</script>

<script lang="ts">
	import { getAudioContext, type InsertMode, type RepeatMode } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { PreferencesIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "outline", tooltipLabel = "Queue preferences", ...restProps }: PreferencesProps = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props: dropdownProps })}
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props: tooltipProps })}
						<Button.Root
							{...dropdownProps}
							{...tooltipProps}
							class={cn(className)}
							data-slot="audio-queue-preferences-trigger"
							{size}
							{variant}
							{...restProps}
						>
							<PreferencesIcon class="size-4" />
						</Button.Root>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content sideOffset={4}>{tooltipLabel}</Tooltip.Content>
			</Tooltip.Root>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class={cn("w-44", className)} data-slot="audio-queue-preferences-content">
		<DropdownMenu.Label class="text-muted-foreground">Repeat Mode</DropdownMenu.Label>
		<DropdownMenu.RadioGroup value={audioStore.repeatMode} onValueChange={(v) => audioStore.setRepeatMode(v as RepeatMode)}>
			<DropdownMenu.RadioItem value="none">None</DropdownMenu.RadioItem>
			<DropdownMenu.RadioItem value="one">One</DropdownMenu.RadioItem>
			<DropdownMenu.RadioItem value="all">All</DropdownMenu.RadioItem>
		</DropdownMenu.RadioGroup>

		<DropdownMenu.Separator />

		<DropdownMenu.Label class="text-muted-foreground">Insert Mode</DropdownMenu.Label>
		<DropdownMenu.RadioGroup value={audioStore.insertMode} onValueChange={(v) => audioStore.setInsertMode(v as InsertMode)}>
			<DropdownMenu.RadioItem value="first">First</DropdownMenu.RadioItem>
			<DropdownMenu.RadioItem value="last">Last</DropdownMenu.RadioItem>
			<DropdownMenu.RadioItem value="after">After Current</DropdownMenu.RadioItem>
		</DropdownMenu.RadioGroup>
	</DropdownMenu.Content>
</DropdownMenu.Root>
