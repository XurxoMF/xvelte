<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type SkipBackProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import { getAudioContext } from "$lib/components/ui/audio/audio-store.svelte";
	import * as Button from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { SkipBackIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	const audioStore = getAudioContext();

	let { class: className, size = "icon", variant = "ghost", onclick, ...restProps }: SkipBackProps = $props();

	const isDisabled = $derived(!audioStore.currentTrack || (audioStore.currentQueueIndex === 0 && audioStore.repeatMode !== "all"));
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				class={cn(className)}
				data-slot="audio-skip-back-button"
				disabled={isDisabled}
				{size}
				{variant}
				{...restProps}
				{...props}
				onclick={(e) => {
					(props.onclick as ((event: MouseEvent) => void) | undefined)?.(e);
					onclick?.(e);
					audioStore.previous();
				}}
			>
				<SkipBackIcon fill="currentColor" />
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content sideOffset={4}>Previous</Tooltip.Content>
</Tooltip.Root>
