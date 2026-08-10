import { createContext } from "svelte";

import type { ChartConfig } from "./chart-utils";

export type ChartContextValue = {
	config: ChartConfig;
};

const [getChartState, setChartState] = createContext<ChartContextValue>();

/**
 * Provides chart configuration to nested chart parts.
 *
 * @param value - Configuration shared by the chart container.
 */
export function setChartContext(value: ChartContextValue) {
	return setChartState(value);
}

/** @returns The configuration from the nearest chart container. */
export function getChartContext() {
	return getChartState();
}
