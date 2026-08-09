<script lang="ts" module>
	import type { Snippet } from "svelte";

	export const rootVariants = tv({
		base: "group relative inline-flex cursor-ew-resize touch-none items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition-colors select-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
		variants: {
			variant: {
				default: "bg-muted text-foreground hover:bg-muted/80",
				primary: "bg-primary text-primary-foreground hover:bg-primary/90",
				outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground"
			},
			size: {
				default: "h-9",
				sm: "h-8 px-2 text-xs",
				lg: "h-10 px-4",
				icon: "size-9 justify-center px-0"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "default"
		}
	});

	export type RootVariants = VariantProps<typeof rootVariants>["variant"];
	export type RootSizes = VariantProps<typeof rootVariants>["size"];
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		sensitivity?: number;
		defaultValue?: number;
		onValueChange?: (v: number) => void;
		variant?: RootVariants;
		size?: RootSizes;
		children: Snippet;
	};
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	import { cn, type WithElementRef } from "$lib/utils";

	import { setScrubbableContext } from "./scrubbable-context";

	let {
		ref = $bindable(null),
		value = $bindable(0),
		min = -Infinity,
		max = Infinity,
		step = 1,
		sensitivity = 2,
		defaultValue,
		variant,
		size,
		class: className,
		onValueChange,
		children,
		...restProps
	}: RootProps = $props();

	let isDragging = $state(false);
	let startX = 0;
	let startValue = 0;

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;

		isDragging = true;
		startX = e.clientX;
		startValue = value;

		document.body.style.cursor = "ew-resize";
		document.body.style.userSelect = "none";

		window.addEventListener("mousemove", handleMove);
		window.addEventListener("mouseup", handleUp);
	}

	function handleMove(e: MouseEvent) {
		if (!isDragging) return;

		const deltaX = e.clientX - startX;
		const isPrecision = e.shiftKey;

		const dragScale = isPrecision ? 0.1 : 1;
		const change = (deltaX / sensitivity) * step * dragScale;

		let newValue = startValue + change;

		newValue = Math.max(min, Math.min(max, newValue));

		if (!isPrecision) {
			newValue = Math.round(newValue / step) * step;
		}

		const decimals = step.toString().split(".")[1]?.length || 0;
		newValue = parseFloat(newValue.toFixed(isPrecision ? decimals + 1 : decimals));

		value = newValue;
		onValueChange?.(newValue);
	}

	function handleUp() {
		isDragging = false;
		document.body.style.cursor = "";
		document.body.style.userSelect = "";

		window.removeEventListener("mousemove", handleMove);
		window.removeEventListener("mouseup", handleUp);
	}

	function handleDoubleClick() {
		let resetVal = defaultValue;

		if (resetVal === undefined) {
			if (min > -Infinity) resetVal = min;
			else resetVal = 0;
		}

		value = resetVal;
		onValueChange?.(value);
	}

	setScrubbableContext({
		value: () => value,
		isDragging: () => isDragging
	});
</script>

<div
	bind:this={ref}
	role="slider"
	aria-valuenow={value}
	aria-valuemin={min}
	aria-valuemax={max}
	tabindex="0"
	onmousedown={handleMouseDown}
	ondblclick={handleDoubleClick}
	data-slot="scrubbable"
	class={cn(rootVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children()}
</div>
