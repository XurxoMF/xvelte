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

	/** Element whose descendant headings should populate the table of contents. */
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

			// Keep visible headings, then select the one closest to the top of the viewport.
			const active = [...visibility]
				.filter((entry) => entry[1] > 0)
				.sort((a, b) => a[0].getBoundingClientRect().top - b[0].getBoundingClientRect().top)[0];

			if (!active) return;

			setActive(this.#toc, Number(active[0].getAttribute(INDEX_ATTRIBUTE)));
		});

		/** Rebuilds the hierarchy and observes every current heading after content changes. */
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

	/** Currently observed heading container. */
	get ref() {
		return this.#ref;
	}

	/** Current reactive heading hierarchy. */
	get current() {
		return this.#toc;
	}

	/** Disconnects observers and clears all retained DOM and heading references. */
	destroy() {
		this.#teardown();
		this.#ref = undefined;
		this.#toc = [];
	}

	/** Disconnects observers created for the previously assigned element. */
	#teardown() {
		this.#cleanup?.();
		this.#cleanup = undefined;
	}
}

/**
 * Converts a heading element into the reactive data consumed by the TOC.
 *
 * @param element - Heading element found in the observed container.
 * @param index - Stable index used to associate observer entries with TOC nodes.
 */
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

/**
 * Builds a nested heading tree from document order and heading levels.
 *
 * @param element - Container whose descendant headings should be indexed.
 */
function getToc(element: HTMLElement): Heading[] {
	// Ignore explicitly excluded subtrees and convert the remaining headings to TOC nodes.
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

/**
 * Visits every heading in depth-first order.
 *
 * @param headings - Heading tree to traverse.
 * @param callback - Function invoked once for every heading.
 */
function visit(headings: Heading[], callback: (heading: Heading) => void) {
	for (const heading of headings) {
		callback(heading);
		visit(heading.children, callback);
	}
}

/**
 * Marks only the heading associated with an observed index as active.
 *
 * @param headings - Heading tree whose active state should change.
 * @param index - Index assigned to the visible heading element.
 */
function setActive(headings: Heading[], index: number) {
	visit(headings, (heading) => {
		heading.active = heading.index === index;
	});
}
