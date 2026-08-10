<script lang="ts" module>
	type ToggleVariants = VariantProps<typeof Toggle.rootVariants>;

	interface ToggleGroupContext extends ToggleVariants {
		spacing?: number | undefined;
		orientation?: "horizontal" | "vertical" | undefined;
	}

	/** @param props - Variant, size, spacing, and orientation shared with group items. */
	export function setToggleGroupCtx(props: ToggleGroupContext) {
		setContext("toggleGroup", props);
	}

	/** @returns Styling and orientation from the nearest toggle-group root. */
	export function getToggleGroupCtx() {
		return getContext<Required<ToggleGroupContext>>("toggleGroup");
	}

	export type RootProps = ToggleGroupPrimitive.RootProps &
		ToggleVariants & {
			spacing?: number | undefined;
			orientation?: "horizontal" | "vertical" | undefined;
		};
</script>

<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import { getContext, setContext } from "svelte";
	import type { VariantProps } from "tailwind-variants";

	import { cn } from "$lib/utils";

	import * as Toggle from "$lib/components/ui/toggle";

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

	setToggleGroupCtx({
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
