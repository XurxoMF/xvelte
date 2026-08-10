import { PersistedState } from "runed";

const DAY_IN_MS = 86_400_000;

export type FrecencyItem = {
	uses: number;
	lastUsage: number;
};

type PersistedStateOptions<T> = ConstructorParameters<typeof PersistedState<T>>[2];

export type UseFrecencyOptions = PersistedStateOptions<FrecencyMap> & {
	maxItems?: number;
};

export type FrecencyMap = Record<string, FrecencyItem>;

/** Persists usage metadata and ranks keys using both frequency and recency. */
export class UseFrecency {
	#items: PersistedState<FrecencyMap>;
	#maxItems: number | undefined;

	/**
	 * @param key - Storage key used by `PersistedState`.
	 * @param initialValue - Usage metadata used when no persisted value exists.
	 * @param options - Persistence options plus an optional result limit.
	 */
	constructor(key: string, initialValue: FrecencyMap = {}, { maxItems, ...persistedOptions }: UseFrecencyOptions = {}) {
		this.#items = new PersistedState<FrecencyMap>(key, initialValue, persistedOptions);
		this.#maxItems = maxItems;
		this.use = this.use.bind(this);
	}

	/**
	 * Records one use and refreshes the key's recency.
	 *
	 * @param key - Item identifier whose usage should be recorded.
	 */
	use(key: string) {
		const item = this.#items.current[key];

		this.#items.current[key] = {
			uses: 1 + (item?.uses ?? 0),
			lastUsage: Date.now()
		};
	}

	/** Returns keys from highest to lowest frecency score. */
	get items() {
		const now = Date.now();
		const entries = Object.entries(this.#items.current);

		return entries
			.sort(([, a], [, b]) => {
				// Usage raises the score while age progressively lowers it, so neither factor dominates forever.
				const scoreDifference = getScore(b, now) - getScore(a, now);
				return scoreDifference || b.lastUsage - a.lastUsage;
			})
			.slice(0, this.#maxItems === undefined ? entries.length : Math.max(0, this.#maxItems))
			.map(([key]) => key);
	}

	/** Removes every recorded item from persisted state. */
	clear() {
		this.#items.current = {};
	}
}

/**
 * Calculates a time-decayed usage score.
 *
 * @param item - Stored usage count and timestamp.
 * @param now - Current timestamp used to measure the item's age.
 */
function getScore(item: FrecencyItem, now: number): number {
	// One day without use halves the contribution of every recorded use.
	const ageInDays = Math.max(0, now - item.lastUsage) / DAY_IN_MS;
	return item.uses / (1 + ageInDays);
}
