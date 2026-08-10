import { SvelteSet } from "svelte/reactivity";

import { HtmlAudio, type Track as AudioTrack } from "$lib/classes/html-audio";

export type Track = AudioTrack;
export type RepeatMode = "none" | "one" | "all";
export type InsertMode = "first" | "last" | "after";

type StoredAudioState = Pick<
	AudioStore,
	| "currentTrack"
	| "queue"
	| "volume"
	| "isMuted"
	| "playbackRate"
	| "repeatMode"
	| "shuffleEnabled"
	| "currentTime"
	| "insertMode"
	| "currentQueueIndex"
>;

const DEFAULT_STORAGE_KEY = "audio:ui:store";

export class AudioStore {
	currentTrack: Track | null = $state(null);
	queue: Track[] = $state([]);
	currentQueueIndex = $state(-1);
	isPlaying = $state(false);
	isLoading = $state(false);
	isBuffering = $state(false);
	isError = $state(false);
	errorMessage: string | null = $state(null);
	volume = $state(1);
	isMuted = $state(false);
	playbackRate = $state(1);
	repeatMode: RepeatMode = $state("none");
	shuffleEnabled = $state(false);
	currentTime = $state(0);
	duration = $state(0);
	bufferedTime = $state(0);
	insertMode: InsertMode = $state("last");

	readonly #audio = new HtmlAudio();
	readonly #storageKey: string | null;
	#initialized = false;
	#loadedTrackUrl: string | null = null;
	#cleanup: (() => void) | undefined;

	constructor(storageKey: string | null = DEFAULT_STORAGE_KEY) {
		this.#storageKey = storageKey;
		this.loadFromStorage();
	}

	get progress() {
		return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
	}

	get isLive() {
		return this.#audio.isLive(this.duration);
	}

	init() {
		if (this.#initialized || typeof window === "undefined") return;
		this.#audio.init();
		const audio = this.#audio.getAudioElement();
		if (!audio) return;
		this.#initialized = true;

		const controller = new AbortController();
		const { signal } = controller;
		const syncTime = () => {
			this.currentTime = audio.currentTime;
			this.duration = audio.duration || 0;
		};
		const syncVolume = () => {
			this.volume = audio.volume;
			this.isMuted = audio.muted;
		};

		audio.addEventListener("play", () => (this.isPlaying = true), { signal });
		audio.addEventListener("pause", () => (this.isPlaying = false), { signal });
		audio.addEventListener("playing", () => ((this.isLoading = false), (this.isBuffering = false)), { signal });
		audio.addEventListener("waiting", () => (this.isBuffering = true), { signal });
		audio.addEventListener("loadstart", () => (this.isLoading = true), { signal });
		audio.addEventListener("canplay", () => ((this.isLoading = false), syncTime()), { signal });
		audio.addEventListener("timeupdate", syncTime, { signal });
		audio.addEventListener("durationchange", syncTime, { signal });
		audio.addEventListener("volumechange", syncVolume, { signal });
		audio.addEventListener("ended", () => this.#handleEnded(), { signal });
		audio.addEventListener("error", () => this.#setError(audio.error?.message ?? "Error loading audio"), { signal });
		this.#audio.addEventListener("bufferUpdate", this.#handleBufferUpdate);
		this.#cleanup = () => {
			controller.abort();
			this.#audio.removeEventListener("bufferUpdate", this.#handleBufferUpdate);
			this.#audio.cleanup();
			this.#initialized = false;
		};
	}

	destroy() {
		this.#cleanup?.();
		this.#cleanup = undefined;
	}

	async play() {
		this.init();
		if (!this.currentTrack || this.isLoading) return;
		try {
			if (this.#loadedTrackUrl !== this.currentTrack.url) await this.#loadCurrentTrack();
			await this.#audio.play();
		} catch (error) {
			this.#setError(error instanceof Error ? error.message : "Error playing audio");
		}
	}

	pause() {
		this.init();
		this.#audio.pause();
		this.isPlaying = false;
	}

	stop() {
		this.pause();
		this.seek(0);
	}

	togglePlay() {
		if (this.isPlaying) this.pause();
		else void this.play();
	}

	seek(time: number) {
		this.init();
		const maximum = this.duration > 0 && Number.isFinite(this.duration) ? this.duration : time;
		this.currentTime = Math.max(0, Math.min(time, maximum));
		this.#audio.setCurrentTime(this.currentTime);
		this.saveToStorage();
	}

	setVolume(volume: number) {
		this.init();
		this.volume = Math.max(0, Math.min(1, volume));
		this.isMuted = this.volume === 0;
		this.#audio.setVolume({ volume: this.volume });
		this.#audio.setMuted(this.isMuted);
		this.saveToStorage();
	}

	setMuted(muted: boolean) {
		this.init();
		this.isMuted = muted;
		this.#audio.setMuted(muted);
		this.saveToStorage();
	}

	toggleMute() {
		this.setMuted(!this.isMuted);
	}

	setPlaybackRate(rate: number) {
		if (this.isLive) return;
		this.playbackRate = Math.max(0.25, Math.min(2, rate));
		this.#audio.setPlaybackRate(this.playbackRate);
		this.saveToStorage();
	}

	setQueue(tracks: Track[], startIndex = 0) {
		this.queue = [...tracks];
		this.currentQueueIndex = tracks[startIndex] ? startIndex : -1;
		this.currentTrack = tracks[startIndex] ?? null;
		this.currentTime = 0;
		this.duration = 0;
		this.bufferedTime = 0;
		this.#loadedTrackUrl = null;
		this.saveToStorage();
	}

	setQueueAndPlay(tracks: Track[], startIndex = 0) {
		this.setQueue(tracks, startIndex);
		if (this.currentTrack) void this.#loadCurrentTrack(true);
	}

	setCurrentTrack(track: Track | null) {
		if (!track) {
			this.stop();
			this.clearQueue();
			return;
		}
		this.setQueueAndPlay([track]);
	}

	next() {
		this.#navigate(1);
	}

	previous() {
		if (this.currentTime > 3 && !this.shuffleEnabled) {
			this.seek(0);
			return;
		}
		this.#navigate(-1);
	}

	addToQueue(track: Track, mode: InsertMode = this.insertMode) {
		if (!this.currentTrack) {
			this.setQueue([track]);
			return;
		}
		if (mode === "first") {
			this.queue = [track, ...this.queue];
			this.currentQueueIndex++;
		} else if (mode === "after") {
			this.queue = [...this.queue.slice(0, this.currentQueueIndex + 1), track, ...this.queue.slice(this.currentQueueIndex + 1)];
		} else this.queue = [...this.queue, track];
		this.saveToStorage();
	}

	addTracksToEndOfQueue(tracks: Track[]) {
		const ids = new SvelteSet(this.queue.map((track) => track.id));
		this.queue = [...this.queue, ...tracks.filter((track) => !ids.has(track.id))];
		this.saveToStorage();
	}

	removeFromQueue(trackId: Track["id"]) {
		const index = this.queue.findIndex((track) => track.id === trackId);
		if (index === -1) return;
		this.queue = this.queue.filter((track) => track.id !== trackId);
		if (index < this.currentQueueIndex) this.currentQueueIndex--;
		else if (index === this.currentQueueIndex) this.currentTrack = this.queue[this.currentQueueIndex] ?? null;
		this.saveToStorage();
	}

	moveInQueue(fromIndex: number, toIndex: number) {
		const queue = [...this.queue];
		const [track] = queue.splice(fromIndex, 1);
		if (!track) return;
		queue.splice(toIndex, 0, track);
		this.queue = queue;
		this.currentQueueIndex = this.currentTrack ? queue.indexOf(this.currentTrack) : -1;
		this.saveToStorage();
	}

	clearQueue() {
		this.queue = [];
		this.currentTrack = null;
		this.currentQueueIndex = -1;
		this.currentTime = 0;
		this.duration = 0;
		this.bufferedTime = 0;
		this.#loadedTrackUrl = null;
		this.saveToStorage();
	}

	shuffle() {
		if (this.queue.length < 2 || !this.currentTrack) return;
		const rest = this.queue.filter((_, index) => index !== this.currentQueueIndex);
		for (let index = rest.length - 1; index > 0; index--) {
			const randomIndex = Math.floor(Math.random() * (index + 1));
			[rest[index], rest[randomIndex]] = [rest[randomIndex]!, rest[index]!];
		}
		this.queue = [this.currentTrack, ...rest];
		this.currentQueueIndex = 0;
		this.shuffleEnabled = true;
		this.saveToStorage();
	}

	unshuffle() {
		this.shuffleEnabled = false;
		this.saveToStorage();
	}

	setRepeatMode(mode: RepeatMode) {
		this.repeatMode = mode;
		this.saveToStorage();
	}

	changeRepeatMode() {
		const modes: RepeatMode[] = ["none", "one", "all"];
		this.setRepeatMode(modes[(modes.indexOf(this.repeatMode) + 1) % modes.length]!);
	}

	setInsertMode(mode: InsertMode) {
		this.insertMode = mode;
		this.saveToStorage();
	}

	loadFromStorage() {
		if (typeof localStorage === "undefined" || !this.#storageKey) return;
		try {
			const stored = JSON.parse(localStorage.getItem(this.#storageKey) ?? "null") as Partial<StoredAudioState> | null;
			if (!stored) return;
			Object.assign(this, stored);
		} catch {
			// Ignore invalid or unavailable persisted state.
		}
	}

	saveToStorage() {
		if (typeof localStorage === "undefined" || !this.#storageKey) return;
		const state: StoredAudioState = {
			currentTrack: this.currentTrack,
			queue: this.queue,
			volume: this.volume,
			isMuted: this.isMuted,
			playbackRate: this.playbackRate,
			repeatMode: this.repeatMode,
			shuffleEnabled: this.shuffleEnabled,
			currentTime: this.currentTime,
			insertMode: this.insertMode,
			currentQueueIndex: this.currentQueueIndex
		};
		try {
			localStorage.setItem(this.#storageKey, JSON.stringify(state));
		} catch {
			// Ignore unavailable storage.
		}
	}

	#navigate(direction: 1 | -1) {
		if (!this.queue.length) return;
		let index = this.shuffleEnabled ? this.#randomIndex() : this.currentQueueIndex + direction;
		if (index >= this.queue.length) index = this.repeatMode === "all" ? 0 : -1;
		if (index < 0) index = this.repeatMode === "all" ? this.queue.length - 1 : -1;
		const track = this.queue[index];
		if (!track) {
			this.stop();
			return;
		}
		this.currentTrack = track;
		this.currentQueueIndex = index;
		this.currentTime = 0;
		this.duration = 0;
		this.bufferedTime = 0;
		this.#loadedTrackUrl = null;
		void this.#loadCurrentTrack(true);
	}

	#randomIndex() {
		if (this.queue.length === 1) return this.repeatMode === "none" ? -1 : 0;
		let index = this.currentQueueIndex;
		while (index === this.currentQueueIndex) index = Math.floor(Math.random() * this.queue.length);
		return index;
	}

	async #loadCurrentTrack(playAfterLoad = false) {
		if (!this.currentTrack) return;
		this.init();
		this.isLoading = true;
		this.isError = false;
		this.errorMessage = null;
		try {
			await this.#audio.load({
				url: this.currentTrack.url,
				startTime: this.currentTime,
				isLiveStream: this.currentTrack.live === true
			});
			this.#loadedTrackUrl = this.currentTrack.url;
			this.#audio.setVolume({ volume: this.volume });
			this.#audio.setMuted(this.isMuted);
			this.#audio.setPlaybackRate(this.playbackRate);
			this.isLoading = false;
			if (playAfterLoad) await this.#audio.play();
			this.saveToStorage();
		} catch (error) {
			this.#setError(error instanceof Error ? error.message : "Error loading audio");
		}
	}

	#handleEnded() {
		if (this.repeatMode === "one") {
			this.seek(0);
			void this.play();
			return;
		}
		this.next();
	}

	#handleBufferUpdate = (event: Event) => {
		if (event instanceof CustomEvent && typeof event.detail?.bufferedTime === "number") this.bufferedTime = event.detail.bufferedTime;
	};

	#setError(message: string) {
		this.isError = true;
		this.errorMessage = message;
		this.isLoading = false;
		this.isBuffering = false;
		this.isPlaying = false;
	}
}

export const musicStore = new AudioStore();
