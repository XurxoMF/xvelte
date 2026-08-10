import { SvelteMap } from "svelte/reactivity";

export type HeadingKind = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type Heading = {
	index: number;
	ref: HTMLHeadingElement;
	kind: HeadingKind;
	id?: string;
	level: number;
	label: string;
	active: boolean;
	children: Heading[];
};

export const INDEX_ATTRIBUTE = "data-toc-index";
export const TOC_IGNORE_ATTRIBUTE = "data-toc-ignore";

/** Builds a reactive heading tree and tracks the first visible heading. */
export class UseToc {
	#ref = $state<HTMLElement>();
	#toc = $state<Heading[]>([]);
	#cleanup?: () => void;

	set ref(ref: HTMLElement | undefined) {
		this.#teardown();
		this.#ref = ref;
		if (!ref) {
			this.#toc = [];
			return;
		}

		// Keep the last ratio for every heading because observer callbacks only contain changed entries.
		const visibility = new SvelteMap<Element, number>();

		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) visibility.set(entry.target, entry.intersectionRatio);

			const active = [...visibility]
				.filter((entry) => entry[1] > 0)
				.sort((a, b) => a[0].getBoundingClientRect().top - b[0].getBoundingClientRect().top)[0];

			if (!active) return;

			setActive(this.#toc, Number(active[0].getAttribute(INDEX_ATTRIBUTE)));
		});

		const refresh = () => {
			observer.disconnect();
			visibility.clear();
			this.#toc = getToc(ref);
			visit(this.#toc, (heading) => observer.observe(heading.ref));
		};

		const mutations = new MutationObserver(refresh);

		mutations.observe(ref, { childList: true, characterData: true, subtree: true });

		refresh();

		this.#cleanup = () => {
			mutations.disconnect();
			observer.disconnect();
		};
	}

	get ref() {
		return this.#ref;
	}

	get current() {
		return this.#toc;
	}

	destroy() {
		this.#teardown();
		this.#ref = undefined;
		this.#toc = [];
	}

	#teardown() {
		this.#cleanup?.();
		this.#cleanup = undefined;
	}
}

function createHeading(element: HTMLHeadingElement, index: number): Heading {
	const kind = element.tagName.toLowerCase() as HeadingKind;
	element.setAttribute(INDEX_ATTRIBUTE, index.toString());
	return {
		index,
		ref: element,
		kind,
		id: element.id || undefined,
		level: Number(kind[1]),
		label: element.innerText,
		active: false,
		children: []
	};
}

function getToc(element: HTMLElement): Heading[] {
	const headings = [...element.querySelectorAll<HTMLHeadingElement>("h1, h2, h3, h4, h5, h6")]
		.filter((heading) => heading.closest(`[${TOC_IGNORE_ATTRIBUTE}]`) === null)
		.map(createHeading);
	const root: Heading[] = [];
	const stack: Heading[] = [];

	for (const heading of headings) {
		// The stack holds the closest heading at every open parent level.
		while (stack.length > 0 && stack.at(-1)!.level >= heading.level) stack.pop();
		const parent = stack.at(-1);
		(parent?.children ?? root).push(heading);
		stack.push(heading);
	}

	return root;
}

function visit(headings: Heading[], callback: (heading: Heading) => void) {
	for (const heading of headings) {
		callback(heading);
		visit(heading.children, callback);
	}
}

function setActive(headings: Heading[], index: number) {
	visit(headings, (heading) => {
		heading.active = heading.index === index;
	});
}
