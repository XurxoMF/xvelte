import { createContext } from "svelte";

import { IsMobile } from "$lib/hooks/is-mobile.svelte";

import { SIDEBAR_KEYBOARD_SHORTCUT } from "./sidebar-constants";

export type SidebarStateProps = {
	/** Reactive desktop state owned by the provider. */
	open: boolean;
};

/** Holds the responsive open state and controls shared by all sidebar parts. */
export class SidebarState {
	readonly props: SidebarStateProps;
	openMobile = $state(false);
	#isMobile: IsMobile;
	state = $derived.by(() => (this.open ? "expanded" : "collapsed"));

	/** @param props - Reactive desktop state getter and setter. */
	constructor(props: SidebarStateProps) {
		this.#isMobile = new IsMobile();
		this.props = props;
	}

	/** Whether the desktop sidebar is open. */
	get open() {
		return this.props.open;
	}

	/** Updates the desktop sidebar state through the provider binding. */
	set open(value: boolean) {
		this.props.open = value;
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
		return this.#isMobile.current ? (this.openMobile = !this.openMobile) : (this.open = !this.open);
	};
}

const [getSidebarState, setSidebarState] = createContext<SidebarState>();

/**
 * Instantiates a new `SidebarState` instance and sets it in the context.
 *
 * @param props - Reactive desktop state getter and setter.
 * @returns The provided `SidebarState` instance.
 */
export function setSidebarContext(props: SidebarStateProps): SidebarState {
	return setSidebarState(new SidebarState(props));
}

/**
 * Retrieves the `SidebarState` instance from context; keep the instance intact so its reactive getters retain their receiver.
 *
 * @returns The `SidebarState` instance.
 */
export function getSidebarContext(): SidebarState {
	return getSidebarState();
}
