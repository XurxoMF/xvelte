<script lang="ts" module>
	import type { WithoutChildren } from "bits-ui";

	import type { RootProps as ButtonProps } from "$lib/components/ui/button";

	export type VolumeProps = WithoutChildren<ButtonProps>;
</script>

<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import * as HoverCard from "$lib/components/ui/hover-card";
	import { VolumeHighIcon, VolumeLowIcon, VolumeMutedIcon } from "$lib/icons";
	import { cn } from "$lib/utils";

	import { getAudioPlayerContext } from "./audio-player-context";

	let { class: className, ...restProps }: VolumeProps = $props();
	const ctx = getAudioPlayerContext();

	function handleVolumeChange(e: Event & { currentTarget: HTMLInputElement }) {
		const val = parseFloat(e.currentTarget.value);
		ctx.setVolume(val);
	}
</script>

<HoverCard.Root openDelay={0} closeDelay={150}>
	<HoverCard.Trigger>
		<Button.Root
			variant="ghost"
			size="icon"
			class={cn("size-8 text-muted-foreground hover:text-foreground", className)}
			data-slot="audio-player-volume"
			onclick={ctx.toggleMute}
			{...restProps}
		>
			{#if ctx.isMuted.value || ctx.volume.value === 0}
				<VolumeMutedIcon class="h-4 w-4" />
			{:else if ctx.volume.value < 0.5}
				<VolumeLowIcon class="h-4 w-4" />
			{:else}
				<VolumeHighIcon class="h-4 w-4" />
			{/if}
		</Button.Root>
	</HoverCard.Trigger>
	<HoverCard.Content side="top" align="center" class="w-2 p-0 shadow-none" sideOffset={10}>
		<div class="flex h-24 flex-col items-center justify-center gap-3">
			<div class="relative h-full w-1.5 rounded-full bg-secondary">
				<div class="absolute bottom-0 left-0 w-full rounded-full bg-primary" style="height: {ctx.isMuted.value ? 0 : ctx.volume.value * 100}%"></div>

				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={ctx.isMuted.value ? 0 : ctx.volume.value}
					oninput={handleVolumeChange}
					class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
					style="appearance: slider-vertical; -webkit-appearance: slider-vertical; width: 32px; left: -13px;"
				/>
			</div>
		</div>
	</HoverCard.Content>
</HoverCard.Root>
