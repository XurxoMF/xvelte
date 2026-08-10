import { PersistedState } from "runed";

export type FrecencyItem = {
	uses: number;
	lastUsage: number;
};

type PersistedStateOptions<T> = ConstructorParameters<typeof PersistedState<T>>[2];

export type UseFrecencyOptions = PersistedStateOptions<FrecencyMap> & {
	maxItems?: number;
};

export type FrecencyMap = Record<string, FrecencyItem | undefined>;

export class UseFrecency {
	#items: PersistedState<FrecencyMap>;

	constructor(
		key: string,
		initialValue: FrecencyMap = {},
		readonly opts: UseFrecencyOptions = {}
	) {
		this.#items = new PersistedState<FrecencyMap>(key, initialValue, this.opts);

		this.use = this.use.bind(this);
	}

	use(key: string) {
		const item = this.#items.current[key];

		this.#items.current[key] = {
			uses: 1 + (item?.uses ?? 0),
			lastUsage: Date.now()
		};
	}

	get items() {
		return Array.from(Object.entries(this.#items.current))
			.filter((entry) => entry[1] !== undefined)
			.sort((aEntry, bEntry) => {
				const a = aEntry[1];
				const b = bEntry[1];
				if (a!.uses > b!.uses) return -1;

				if (b!.uses > a!.uses) return 1;

				return a!.lastUsage - b!.lastUsage;
			})
			.slice(0, this.opts.maxItems)
			.map(([key]) => key);
	}

	clear() {
		this.#items.current = {};
	}
}
