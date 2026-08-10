import { getContext, setContext } from "svelte";

import { IsMobile } from "$lib/hooks/is-mobile.svelte";

import { SIDEBAR_KEYBOARD_SHORTCUT } from "./sidebar-constants";

type Getter<T> = () => T;

export type SidebarStateProps = {
	/**
	 * A getter function that returns the current open state of the sidebar.
	 * We use a getter function here to support `bind:open` on the `Sidebar.Provider`
	 * component.
	 */
	open: Getter<boolean>;

	/**
	 * A function that sets the open state of the sidebar. To support `bind:open`, we need
	 * a source of truth for changing the open state to ensure it will be synced throughout
	 * the sub-components and any `bind:` references.
	 */
	setOpen: (open: boolean) => void;
};

/** Holds the responsive open state and controls shared by all sidebar parts. */
export class SidebarState {
	readonly props: SidebarStateProps;
	open = $derived.by(() => this.props.open());
	openMobile = $state(false);
	setOpen: SidebarStateProps["setOpen"];
	#isMobile: IsMobile;
	state = $derived.by(() => (this.open ? "expanded" : "collapsed"));

	/** @param props - Reactive desktop state getter and setter. */
	constructor(props: SidebarStateProps) {
		this.setOpen = props.setOpen;
		this.#isMobile = new IsMobile();
		this.props = props;
	}

	/** Whether the current viewport is below the mobile breakpoint. */
	get isMobile() {
		return this.#isMobile.current;
	}

	/** @param e - Window keydown event matched against the configured sidebar shortcut. */
	handleShortcutKeydown = (e: KeyboardEvent) => {
		if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			this.toggle();
		}
	};

	/** @param value - Next open state for the mobile drawer. */
	setOpenMobile = (value: boolean) => {
		this.openMobile = value;
	};

	/** Toggles the mobile drawer or desktop sidebar for the current viewport. */
	toggle = () => {
		return this.#isMobile.current ? (this.openMobile = !this.openMobile) : this.setOpen(!this.open);
	};
}

export const SIDEBAR_CONTEXT = "scn-sidebar";

/**
 * Instantiates a new `SidebarState` instance and sets it in the context.
 *
 * @param props - Reactive desktop state getter and setter.
 * @returns The provided `SidebarState` instance.
 */
export function setSidebar(props: SidebarStateProps): SidebarState {
	return setContext(Symbol.for(SIDEBAR_CONTEXT), new SidebarState(props));
}

/**
 * Retrieves the `SidebarState` instance from context; keep the instance intact so its reactive getters retain their receiver.
 *
 * @returns The `SidebarState` instance.
 */
export function useSidebar(): SidebarState {
	return getContext(Symbol.for(SIDEBAR_CONTEXT));
}
