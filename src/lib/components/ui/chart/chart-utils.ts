import type { Tooltip } from "layerchart";
import type { Component, Snippet } from "svelte";

export const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
	[k in string]: {
		label?: string | undefined;
		icon?: Component | undefined;
	} & ({ color?: string | undefined; theme?: never | undefined } | { color?: never | undefined; theme: Record<keyof typeof THEMES, string> });
};

export type ExtractSnippetParams<T> = T extends Snippet<[infer P]> ? P : never;

export type TooltipPayload = Tooltip.TooltipSeries;

/**
 * Resolves the chart configuration entry represented by a tooltip payload.
 *
 * @param config - Complete chart series configuration.
 * @param payload - Tooltip series emitted by LayerChart.
 * @param key - Preferred property used to identify the series.
 * @param data - Optional source datum used as a final key lookup.
 * @returns The matching series configuration, when one exists.
 */
export function getPayloadConfigFromPayload(
	config: ChartConfig,
	payload: TooltipPayload,
	key: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: Record<string, any> | null | undefined
) {
	if (typeof payload !== "object" || payload === null) return undefined;

	const payloadConfig = "config" in payload && typeof payload.config === "object" && payload.config !== null ? payload.config : undefined;

	let configLabelKey: string = key;

	if (payload.key === key) {
		configLabelKey = payload.key;
	} else if (payload.label === key) {
		configLabelKey = payload.label;
	} else if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
		configLabelKey = payload[key as keyof typeof payload] as string;
	} else if (payloadConfig !== undefined && key in payloadConfig && typeof payloadConfig[key as keyof typeof payloadConfig] === "string") {
		configLabelKey = payloadConfig[key as keyof typeof payloadConfig] as string;
	} else if (data != null && key in data && typeof data[key] === "string") {
		configLabelKey = data[key] as string;
	}

	return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}
