type KeyboardState = {
	inputValue: string;
	values: string[];
	tagIndex?: number;
	suggestionIndex?: number;
	suggestions: string[];
	showSuggestions: boolean;
	isComposing: boolean;
	setTagIndex: (index?: number) => void;
	setSuggestionIndex: (index?: number) => void;
	selectSuggestion: (value: string) => void;
	deleteIndex: (index: number) => void;
	enter: () => void;
};

/**
 * Coordinates keyboard navigation between the text input, existing tags, and suggestions.
 *
 * @param event - Keyboard event emitted by the tags input.
 * @param state - Current input state and mutation callbacks.
 */
export function handleKeydown(event: KeyboardEvent, state: KeyboardState) {
	const input = event.currentTarget as HTMLInputElement;
	if (event.key === "Escape" && state.showSuggestions) {
		state.setSuggestionIndex();
		input.blur();
		return;
	}

	if (state.showSuggestions && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
		event.preventDefault();
		const direction = event.key === "ArrowDown" ? 1 : -1;
		const current = state.suggestionIndex ?? (direction > 0 ? -1 : 0);
		state.setSuggestionIndex((current + direction + state.suggestions.length) % state.suggestions.length);
		return;
	}

	if (event.key === "Enter") {
		event.preventDefault();
		if (state.isComposing) return;
		if (state.tagIndex !== undefined) {
			state.deleteIndex(state.tagIndex);
			state.setTagIndex(state.tagIndex > 0 ? state.tagIndex - 1 : undefined);
		} else if (state.showSuggestions && state.suggestionIndex !== undefined) {
			state.selectSuggestion(state.suggestions[state.suggestionIndex]);
		} else {
			state.enter();
		}
		return;
	}

	const atBeginning = input.selectionStart === 0 && input.selectionEnd === 0;
	if (!atBeginning) {
		state.setTagIndex();
		return;
	}

	if (event.key === "Backspace") {
		event.preventDefault();
		if (state.tagIndex !== undefined) state.deleteIndex(state.tagIndex);
		const previous = (state.tagIndex ?? state.values.length) - 1;
		state.setTagIndex(previous >= 0 ? previous : undefined);
		return;
	}

	if (event.key === "Delete" && state.inputValue.length === 0 && state.tagIndex !== undefined) {
		event.preventDefault();
		state.deleteIndex(state.tagIndex);
		const next = Math.min(state.tagIndex, state.values.length - 2);
		state.setTagIndex(next >= 0 ? next : undefined);
		return;
	}

	if (event.key === "ArrowLeft") {
		state.setTagIndex(Math.max(0, (state.tagIndex ?? state.values.length) - 1));
		return;
	}

	if (event.key === "ArrowRight" && state.inputValue.length === 0 && state.tagIndex !== undefined) {
		const next = state.tagIndex + 1;
		state.setTagIndex(next < state.values.length ? next : undefined);
		return;
	}

	state.setTagIndex();
}
