<script lang="ts" module>
	export type SuggestionProps = {
		id: string;
		value: string;
		active: boolean;
		onSelect: (value: string) => void;
	};
</script>

<script lang="ts">
	let { id, value, active, onSelect }: SuggestionProps = $props();
</script>

<button
	data-slot="tags-input-suggestion"
	{id}
	type="button"
	role="option"
	aria-selected={active}
	class="w-full cursor-default rounded-sm px-2 py-1.5 text-left text-sm outline-hidden transition-colors select-none hover:bg-accent aria-selected:bg-accent"
	onmousedown={(e) => {
		e.preventDefault();
		onSelect(value);
	}}
>
	{value}
</button>
