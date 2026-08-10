import { createContext } from "svelte";

/** Owns the native audio element, reactive playback state, and player controls. */
export class AudioPlayerState {
	audio = $state<HTMLAudioElement>();
	paused = $state(true);
	duration = $state(0);
	currentTime = $state(0);
	volume = $state(1);
	muted = $state(false);

	/** Whether native playback is currently running. */
	isPlaying = $derived(!this.paused);

	constructor() {
		this.togglePlay = this.togglePlay.bind(this);
		this.seek = this.seek.bind(this);
		this.setVolume = this.setVolume.bind(this);
		this.toggleMute = this.toggleMute.bind(this);
	}

	/** Toggles playback on the native audio element. */
	togglePlay() {
		if (!this.audio) return;

		if (this.audio.paused) {
			void this.audio.play();
		} else {
			this.audio.pause();
		}
	}

	/** @param time - Playback position to seek to, in seconds. */
	seek(time: number) {
		if (!this.audio) return;

		this.audio.currentTime = time;
		this.currentTime = time;
	}

	/** @param volume - Native audio volume between 0 and 1. */
	setVolume(volume: number) {
		if (!this.audio) return;

		this.audio.volume = volume;
		this.volume = volume;
	}

	/** Toggles the native muted state without discarding the chosen volume. */
	toggleMute() {
		this.muted = !this.muted;
	}
}

const [getAudioPlayerState, setAudioPlayerState] = createContext<AudioPlayerState>();

/**
 * Provides audio-player state to descendant controls.
 *
 * @param state - Reactive state owned by `AudioPlayer.Root`.
 */
export function setAudioPlayerContext(state: AudioPlayerState) {
	return setAudioPlayerState(state);
}

/** @returns The state from the nearest audio-player root. */
export function getAudioPlayerContext() {
	return getAudioPlayerState();
}
