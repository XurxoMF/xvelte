<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type ShuffleProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { ShuffleIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "outline", ...restProps }: ShuffleProps = $props();

	function handleToggle() {
		if (audioStore.shuffleEnabled) {
			audioStore.unshuffle();
		} else {
			audioStore.shuffle();
		}
	}
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				{...props}
				{variant}
				{size}
				aria-label="Shuffle"
				data-slot="audio-queue-shuffle"
				data-state={audioStore.shuffleEnabled ? "on" : "off"}
				class={cn(audioStore.shuffleEnabled && "bg-accent! text-accent-foreground!", className)}
				onclick={handleToggle}
				{...restProps}
			>
				<ShuffleIcon class="size-4" />
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content side="top" sideOffset={4}>
		Shuffle {audioStore.shuffleEnabled ? "on" : "off"}
	</Tooltip.Content>
</Tooltip.Root>
