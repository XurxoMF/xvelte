import { getContext, setContext } from "svelte";

const AUDIO_PLAYER_KEY = Symbol("audio-player");

type AudioPlayerContext = {
	isPlaying: { value: boolean };
	duration: { value: number };
	currentTime: { value: number };
	volume: { value: number };
	isMuted: { value: boolean };
	togglePlay: () => void;
	seek: (time: number) => void;
	toggleMute: () => void;
	setVolume: (v: number) => void;
};

/**
 * Provides the player's reactive state and controls to descendant parts.
 *
 * @param props - State boxes and control callbacks owned by `AudioPlayer.Root`.
 */
export function setAudioPlayerContext(props: AudioPlayerContext) {
	setContext(AUDIO_PLAYER_KEY, props);
}

/** @returns The nearest audio-player context. */
export function getAudioPlayerContext() {
	return getContext<AudioPlayerContext>(AUDIO_PLAYER_KEY);
}
