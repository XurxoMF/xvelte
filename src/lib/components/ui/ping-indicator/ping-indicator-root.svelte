<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Connection quality derived from the smoothed probe latency. */
	export type PingStatus = "excellent" | "good" | "fair" | "poor" | "offline" | "idle";

	/** Latency boundaries, in milliseconds, used to derive connection quality. */
	export type PingThresholds = {
		/** Upper latency included in the excellent status. */
		excellent: number;
		/** Upper latency included in the good status. */
		good: number;
		/** Upper latency included in the fair status. */
		fair: number;
	};

	/** Semantic size presets for the indicator track and optional text. */
	export const pingIndicatorSizes = {
		sm: { track: "h-3 w-4", gap: "gap-px", text: "text-xs" },
		md: { track: "h-4 w-5", gap: "gap-0.5", text: "text-xs" },
		lg: { track: "h-6 w-8", gap: "gap-0.5", text: "text-sm" }
	} as const;

	/** Available visual sizes for the ping indicator. */
	export type PingIndicatorSize = keyof typeof pingIndicatorSizes;

	/** Props for the live connection-quality indicator. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & {
		url?: string | undefined;
		probe?: (() => Promise<number>) | undefined;
		latency?: number | null | undefined;
		bars?: number | undefined;
		interval?: number | undefined;
		timeout?: number | undefined;
		smoothing?: number | undefined;
		paused?: boolean | undefined;
		pauseWhenHidden?: boolean | undefined;
		thresholds?: PingThresholds | undefined;
		size?: PingIndicatorSize | undefined;
		showLatency?: boolean | undefined;
		label?: string | undefined;
		onsample?: ((latency: number | null) => void) | undefined;
		children?: Snippet<[{ status: PingStatus; level: number; latency: number | null }]> | undefined;
	};
</script>

<script lang="ts">
	import { onMount } from "svelte";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		url,
		probe,
		latency = $bindable<number | null>(null),
		bars = 4,
		interval = 3000,
		timeout = 5000,
		smoothing = 3,
		paused = false,
		pauseWhenHidden = true,
		thresholds = { excellent: 80, good: 200, fair: 500 },
		size = "md",
		showLatency = false,
		label,
		class: className,
		onsample,
		children,
		...restProps
	}: RootProps = $props();

	// This flag must not be reactive because a completed probe must not restart the polling effect.
	let inFlight = false;
	let hidden = $state(false);
	let recent = $state<(number | null)[]>([]);

	const smoothed = $derived.by(() => {
		const successful = recent.filter((sample): sample is number => sample !== null);
		if (recent.length === 0) return undefined;
		if (successful.length === 0) return null;

		const sorted = [...successful].sort((a, b) => a - b);
		return sorted[Math.floor(sorted.length / 2)];
	});

	const status = $derived.by<PingStatus>(() => {
		if (smoothed === undefined) return "idle";
		if (smoothed === null) return "offline";
		if (smoothed <= thresholds.excellent) return "excellent";
		if (smoothed <= thresholds.good) return "good";
		if (smoothed <= thresholds.fair) return "fair";
		return "poor";
	});

	const level = $derived.by(() => {
		const ratio = { excellent: 1, good: 0.75, fair: 0.5, poor: 0.25, offline: 0, idle: 0 }[status];
		return Math.round(ratio * Math.max(1, bars));
	});

	const statusColor: Record<PingStatus, string> = {
		excellent: "bg-primary",
		good: "bg-primary",
		fair: "bg-accent",
		poor: "bg-destructive",
		offline: "bg-destructive",
		idle: "bg-muted-foreground"
	};

	const statusLabel: Record<PingStatus, string> = {
		excellent: "Excellent connection",
		good: "Good connection",
		fair: "Fair connection",
		poor: "Poor connection",
		offline: "Offline",
		idle: "Checking connection"
	};

	const dimensions = $derived(pingIndicatorSizes[size]);
	const running = $derived(!paused && !(pauseWhenHidden && hidden));

	/** @param sample - Latest latency sample, or null when the probe failed. */
	function record(sample: number | null) {
		latency = sample;
		recent = [...recent, sample].slice(-Math.max(1, smoothing));
		onsample?.(sample);
	}

	/** @returns Round-trip duration measured against the configured endpoint. */
	async function defaultProbe(): Promise<number> {
		const target = url ?? window.location.origin;
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout);
		const started = performance.now();

		try {
			await fetch(`${target}${target.includes("?") ? "&" : "?"}_ping=${Date.now()}`, {
				method: "HEAD",
				cache: "no-store",
				mode: "no-cors",
				signal: controller.signal
			});
			return performance.now() - started;
		} finally {
			clearTimeout(timer);
		}
	}

	/** Runs one probe unless another probe is already in flight. */
	export async function ping() {
		if (inFlight) return;
		inFlight = true;

		try {
			const sample = await (probe ?? defaultProbe)();
			record(Number.isFinite(sample) ? Math.round(sample) : null);
		} catch {
			record(null);
		} finally {
			inFlight = false;
		}
	}

	/** Clears the latency history and returns the indicator to its idle state. */
	export function reset() {
		recent = [];
		latency = null;
	}

	onMount(() => {
		/** Synchronizes polling with the current document visibility. */
		const handleVisibilityChange = () => {
			hidden = document.visibilityState === "hidden";
		};

		handleVisibilityChange();
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	});

	$effect(() => {
		if (!running) return;

		ping();
		const timer = setInterval(ping, interval);
		return () => clearInterval(timer);
	});
</script>

<span
	bind:this={ref}
	data-slot="ping-indicator"
	class={cn("inline-flex items-center gap-1.5", className)}
	role="status"
	aria-live="off"
	title={label ?? statusLabel[status]}
	aria-label={`${label ? `${label}: ` : ""}${statusLabel[status]}${latency === null ? "" : `, ${latency} ms`}`}
	{...restProps}
>
	{#if children}
		{@render children({ status, level, latency })}
	{:else}
		<span class={cn("inline-flex items-end", dimensions.track, dimensions.gap)} aria-hidden="true">
			{#each Array.from({ length: Math.max(1, bars) }, (_, index) => index) as index (index)}
				{@const lit = index < level}
				<span
					class={cn(
						"flex-1 rounded-xs transition-colors duration-300",
						lit ? statusColor[status] : "bg-muted-foreground/25",
						lit && index === level - 1 && running && "animate-pulse"
					)}
					style:height="{((index + 1) / Math.max(1, bars)) * 100}%"
				></span>
			{/each}
		</span>

		{#if status === "offline"}
			<span class={cn("font-medium text-destructive", dimensions.text)}>offline</span>
		{:else if showLatency}
			<span class={cn("font-mono text-muted-foreground tabular-nums", dimensions.text)}>
				{latency === null ? "—" : `${latency} ms`}
			</span>
		{:else if label}
			<span class={cn("text-muted-foreground", dimensions.text)}>{label}</span>
		{/if}
	{/if}
</span>
