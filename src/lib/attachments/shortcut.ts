import type { Attachment } from "svelte/attachments";

export type ShortcutEvent = "keydown" | "keyup" | "keypress";

export type Shortcut = {
	key: string;
	action: (event: KeyboardEvent) => void | Promise<void>;
	event?: ShortcutEvent;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	meta?: boolean;
	preventDefault?: boolean;
	stopPropagation?: boolean;
	when?: (event: KeyboardEvent) => boolean;
};

export function shortcut(options: Shortcut | Shortcut[]): Attachment<Window> {
	return (node) => {
		const shortcuts = Array.isArray(options) ? options : [options];
		const eventTypes = new Set(shortcuts.map((option) => option.event ?? "keydown"));

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

function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
	if (event.type !== (shortcut.event ?? "keydown")) return false;
	if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return false;
	if (event.ctrlKey !== Boolean(shortcut.ctrl)) return false;
	if (event.shiftKey !== Boolean(shortcut.shift)) return false;
	if (event.altKey !== Boolean(shortcut.alt)) return false;
	if (event.metaKey !== Boolean(shortcut.meta)) return false;
	return shortcut.when?.(event) ?? true;
}
