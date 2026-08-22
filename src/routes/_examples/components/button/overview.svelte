<script lang="ts">
	import * as Button from "$lib/components/ui/button";
	import { PlusIcon } from "$lib/icons";
</script>

<div class="flex flex-col items-center justify-center gap-6">
	<div class="flex flex-wrap items-center justify-center gap-2">
		<Button.Root variant="default">Default</Button.Root>
		<Button.Root variant="outline">Outline</Button.Root>
		<Button.Root variant="secondary">Secondary</Button.Root>
		<Button.Root variant="ghost">Ghost</Button.Root>
		<Button.Root variant="destructive">Destructive</Button.Root>
		<Button.Root variant="link">Link</Button.Root>
	</div>

	<div class="flex flex-wrap items-center justify-center gap-2">
		<Button.Root size="xs">Extra small</Button.Root>
		<Button.Root size="sm">Small</Button.Root>
		<Button.Root size="default">Default</Button.Root>
		<Button.Root size="lg">Large</Button.Root>
		<Button.Root size="icon" aria-label="Add item"><PlusIcon /></Button.Root>
	</div>
</div>
