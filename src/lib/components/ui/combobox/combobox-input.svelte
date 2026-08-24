<script lang="ts" module>
	export type InputProps = { placeholder?: string | undefined; class?: string | undefined };
</script>

<script lang="ts">
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";
	import * as Command from "$lib/components/ui/command";

	let { placeholder = m.harbor_wren_pause(), class: className }: InputProps = $props();
</script>

<Command.Input data-slot="combobox-input" {placeholder} class={cn(className)} />
