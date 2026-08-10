import type { Attachment } from "svelte/attachments";

export type ShortcutEvent = "keydown" | "keyup" | "keypress";

/** Describes a keyboard shortcut and the action it invokes. */
export type Shortcut = {
	/** Key reported by `KeyboardEvent.key`, matched case-insensitively. */
	key: string;
	/** Callback invoked with the matching keyboard event. */
	action: (event: KeyboardEvent) => void | Promise<void>;
	/** Keyboard event to listen for. @default "keydown" */
	event?: ShortcutEvent | undefined;
	/** Whether Control must be pressed. */
	ctrl?: boolean | undefined;
	/** Whether Shift must be pressed. */
	shift?: boolean | undefined;
	/** Whether Alt must be pressed. */
	alt?: boolean | undefined;
	/** Whether Meta must be pressed. */
	meta?: boolean | undefined;
	/** Prevents the browser default when the shortcut matches. @default true */
	preventDefault?: boolean | undefined;
	/** Stops the matching event from propagating. @default false */
	stopPropagation?: boolean | undefined;
	/** Optional predicate used to enable the shortcut conditionally. */
	when?: ((event: KeyboardEvent) => boolean) | undefined;
};

/**
 * Creates a window attachment that registers one or more keyboard shortcuts and removes them when detached.
 *
 * @param options - Shortcut definition or definitions to register.
 * @returns An attachment intended for `<svelte:window>`.
 */
export function shortcut(options: Shortcut | Shortcut[]): Attachment<Window> {
	return (node) => {
		const shortcuts = Array.isArray(options) ? options : [options];
		const eventTypes = new Set(shortcuts.map((option) => option.event ?? "keydown"));

		/** Finds and invokes the first shortcut matching the received keyboard event. */
		const handleKeyboardEvent = (event: Event): void => {
			if (!(event instanceof KeyboardEvent)) return;
			const match = shortcuts.find((shortcut) => matchesShortcut(event, shortcut));
			if (!match) return;

			if (match.preventDefault ?? true) event.preventDefault();
			if (match.stopPropagation) event.stopPropagation();
			void match.action(event);
		};

		for (const eventType of eventTypes) node.addEventListener(eventType, handleKeyboardEvent);

		return () => {
			for (const eventType of eventTypes) node.removeEventListener(eventType, handleKeyboardEvent);
		};
	};
}

/**
 * Checks the event type, key, exact modifier state, and optional shortcut predicate.
 *
 * @param event - Keyboard event to evaluate.
 * @param shortcut - Shortcut definition to compare against.
 */
function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
	if (event.type !== (shortcut.event ?? "keydown")) return false;
	if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return false;
	if (event.ctrlKey !== Boolean(shortcut.ctrl)) return false;
	if (event.shiftKey !== Boolean(shortcut.shift)) return false;
	if (event.altKey !== Boolean(shortcut.alt)) return false;
	if (event.metaKey !== Boolean(shortcut.meta)) return false;
	return shortcut.when?.(event) ?? true;
}
