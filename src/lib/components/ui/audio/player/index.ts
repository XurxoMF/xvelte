import Root, { type RootProps } from "./audio-player-root.svelte";
import ControlBar, { type ControlBarProps, type ControlBarVariant } from "./audio-player-control-bar.svelte";
import ControlGroup, { type ControlGroupProps } from "./audio-player-control-group.svelte";
import FastForward, { type FastForwardProps } from "./audio-player-fast-forward.svelte";
import Play, { type PlayProps } from "./audio-player-play.svelte";
import Rewind, { type RewindProps } from "./audio-player-rewind.svelte";
import SeekBar, { type SeekBarProps } from "./audio-player-seek-bar.svelte";
import SkipBack, { type SkipBackProps } from "./audio-player-skip-back.svelte";
import SkipForward, { type SkipForwardProps } from "./audio-player-skip-forward.svelte";
import TimeDisplay, { type TimeDisplayProps } from "./audio-player-time-display.svelte";
import Volume, { type VolumeProps } from "./audio-player-volume.svelte";

export {
	Root,
	ControlBar,
	ControlGroup,
	FastForward,
	Play,
	Rewind,
	SeekBar,
	SkipBack,
	SkipForward,
	TimeDisplay,
	Volume,
	//
	type RootProps,
	type ControlBarProps,
	type ControlBarVariant,
	type ControlGroupProps,
	type FastForwardProps,
	type PlayProps,
	type RewindProps,
	type SeekBarProps,
	type SkipBackProps,
	type SkipForwardProps,
	type TimeDisplayProps,
	type VolumeProps
};
