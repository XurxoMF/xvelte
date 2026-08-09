<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type RepeatModeProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { RepeatIcon, RepeatOneIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "outline", ...restProps }: RepeatModeProps = $props();

	const isPressed = $derived(audioStore.repeatMode !== "none");
	const Icon = $derived(audioStore.repeatMode === "one" ? RepeatOneIcon : RepeatIcon);
	const tooltipText = $derived(() => {
		if (audioStore.repeatMode === "one") return "Repeat this track";
		if (audioStore.repeatMode === "all") return "Repeat playlist";
		return "Disable repeat";
	});
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				{...props}
				type="button"
				aria-label="Repeat mode"
				data-slot="audio-repeat-mode-trigger"
				data-state={isPressed ? "on" : "off"}
				class={cn(isPressed && "bg-accent! text-accent-foreground!", className)}
				onclick={() => audioStore.changeRepeatMode()}
				{size}
				{variant}
				{...restProps}
			>
				<Icon class="size-4" />
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content side="top" sideOffset={4}>
		{tooltipText()}
	</Tooltip.Content>
</Tooltip.Root>
