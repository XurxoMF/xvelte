<script lang="ts" module>
	import { MessageScroller as MessageScrollerPrimitive } from "@shadcn-svelte/primitives/message-scroller";

	import * as Button from "$lib/components/ui/button";

	/** Props accepted by the Message Scroller edge-navigation control. */
	export type ButtonProps = MessageScrollerPrimitive.ButtonProps & {
		variant?: Button.RootVariants | undefined;
		size?: Button.RootSizes | undefined;
	};
</script>

<script lang="ts">
	import { ChevronDownIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		direction = "end",
		class: className,
		children,
		child: childProp,
		variant = "secondary",
		size = "icon-sm",
		...restProps
	}: ButtonProps = $props();
</script>

<MessageScrollerPrimitive.Button
	bind:ref
	data-slot="message-scroller-button"
	data-direction={direction}
	data-variant={variant}
	data-size={size}
	{direction}
	class={cn(
		"absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
		className
	)}
	{...restProps}
>
	{#snippet child(state)}
		{#if childProp}
			{@render childProp(state)}
		{:else}
			<Button.Root {variant} {size} {...state.props}>
				{#if children}
					{@render children()}
				{:else}
					<ChevronDownIcon />
					<span class="sr-only">{direction === "end" ? m.gentle_river_scroll_end() : m.soft_owl_scroll_start()}</span>
				{/if}
			</Button.Root>
		{/if}
	{/snippet}
</MessageScrollerPrimitive.Button>
