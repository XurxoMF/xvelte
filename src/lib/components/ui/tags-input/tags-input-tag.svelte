<script lang="ts">
	import { CloseIcon } from "$lib/icons";

	type Props = {
		value: string;
		disabled: boolean | null;
		active: boolean;
		onDelete: (value: string) => void;
	};

	let { value, disabled, onDelete, active }: Props = $props();
</script>

<div
	data-slot="tags-input-tag"
	class="flex place-items-center gap-2 rounded-md bg-secondary px-2 py-0.5 ring-offset-background transition-all hover:cursor-default hover:bg-secondary/90 aria-selected:bg-secondary/90 aria-selected:ring-2 aria-selected:ring-ring aria-selected:ring-offset-2"
	aria-selected={active}
>
	<span>
		{value}
	</span>
	<button data-slot="tags-input-tag-delete" type="button" {disabled} onclick={() => onDelete(value)}>
		<CloseIcon class="size-4" />
	</button>
</div>
