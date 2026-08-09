<script lang="ts" module>
	export type RootProps = SVGAttributes<SVGSVGElement>;
</script>

<script lang="ts">
	import type { SVGAttributes } from "svelte/elements";

	import { LoaderIcon } from "$lib/icons";

	import { cn } from "$lib/utils";

	let {
		class: className,
		role = "status",
		// we add name, color, and stroke for compatibility with different icon libraries props
		name,
		color,
		stroke,
		"aria-label": ariaLabel = "Loading",
		...restProps
	}: RootProps = $props();
</script>

<LoaderIcon
	{role}
	name={name === null ? undefined : name}
	color={color === null ? undefined : color}
	stroke={stroke === null ? undefined : stroke}
	aria-label={ariaLabel}
	class={cn("size-4 animate-spin", className)}
	{...restProps}
/>
