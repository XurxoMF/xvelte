<script lang="ts" module>
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";

	import type { ToggleGroupContext } from "./toggle-group-context";

	export type RootProps = ToggleGroupPrimitive.RootProps & ToggleGroupContext;
</script>

<script lang="ts">
	import { setToggleGroupContext } from "./toggle-group-context";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		size = "default",
		spacing = 0,
		orientation = "horizontal",
		variant = "default",
		...restProps
	}: RootProps = $props();

	setToggleGroupContext({
		/** Current toggle visual variant. */
		get variant() {
			return variant;
		},
		/** Current toggle size. */
		get size() {
			return size;
		},
		/** Gap between adjacent group items. */
		get spacing() {
			return spacing;
		},
		/** Current group orientation. */
		get orientation() {
			return orientation;
		}
	});
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<ToggleGroupPrimitive.Root
	bind:value={value as never}
	bind:ref
	{orientation}
	data-slot="toggle-group"
	data-variant={variant}
	data-size={size}
	data-spacing={spacing}
	style={`--gap: ${spacing}`}
	class={cn(
		"group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=0]:data-[variant=outline]:shadow-xs data-vertical:flex-col data-vertical:items-stretch",
		className
	)}
	{...restProps}
/>
