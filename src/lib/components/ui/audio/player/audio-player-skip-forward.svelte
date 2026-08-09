<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type SkipForwardProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { SkipForwardIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "ghost", onclick, ...restProps }: SkipForwardProps = $props();

	const isDisabled = $derived(
		!audioStore.currentTrack || (audioStore.currentQueueIndex === audioStore.queue.length - 1 && audioStore.repeatMode !== "all")
	);
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				aria-label="Next"
				class={cn(className)}
				data-slot="audio-skip-forward-button"
				disabled={isDisabled}
				{size}
				{variant}
				{...restProps}
				{...props}
				onclick={(e) => {
					(props.onclick as ((event: MouseEvent) => void) | undefined)?.(e);
					onclick?.(e);
					audioStore.next();
				}}
			>
				<SkipForwardIcon fill="currentColor" />
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={4}>Next</Tooltip.Content>
</Tooltip.Root>
