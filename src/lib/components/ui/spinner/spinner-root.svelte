<script lang="ts" module>
	import type { SVGAttributes } from "svelte/elements";

	export type RootProps = SVGAttributes<SVGSVGElement>;
</script>

<script lang="ts">
	import { LoaderIcon } from "$lib/icons";
	import * as m from "$lib/paraglide/messages.js";
	import { cn } from "$lib/utils";

	let {
		class: className,
		role = "status",
		// we add name, color, and stroke for compatibility with different icon libraries props
		name,
		color,
		stroke,
		"aria-label": ariaLabel = m.lucky_cedar_load(),
		...restProps
	}: RootProps = $props();
</script>

<LoaderIcon
	data-slot="spinner"
	{role}
	name={name === null ? undefined : name}
	color={color === null ? undefined : color}
	stroke={stroke === null ? undefined : stroke}
	aria-label={ariaLabel}
	class={cn("size-4 animate-spin", className)}
	{...restProps}
/>
