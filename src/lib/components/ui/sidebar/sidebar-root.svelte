<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";

	import type { WithElementRef } from "$lib/utils";

	/** Props for the responsive Sidebar root. */
	export type RootProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		side?: "left" | "right" | undefined;
		variant?: "sidebar" | "floating" | "inset" | undefined;
		collapsible?: "offcanvas" | "icon" | "none" | undefined;
		/** Whether the desktop sidebar is sized by its container or anchored to the viewport. */
		position?: "container" | "viewport" | undefined;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils";
	import * as m from "$lib/paraglide/messages.js";
	import * as Sheet from "$lib/components/ui/sheet";

	import * as Sidebar from ".";

	let {
		ref = $bindable(null),
		side = "left",
		variant = "sidebar",
		collapsible = "offcanvas",
		position = "container",
		class: className,
		children,
		...restProps
	}: RootProps = $props();

	const sidebar = Sidebar.getSidebarContext();
</script>

{#if collapsible === "none"}
	<div
		class={cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className)}
		data-position={position}
		bind:this={ref}
		{...restProps}
	>
		{@render children?.()}
	</div>
{:else if sidebar.isMobile}
	<Sheet.Root bind:open={() => sidebar.openMobile, (v) => sidebar.setOpenMobile(v)} {...restProps}>
		<Sheet.Content
			bind:ref
			data-sidebar="sidebar"
			data-slot="sidebar"
			data-mobile="true"
			data-position={position}
			class={cn("w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden", className)}
			style="--sidebar-width: {Sidebar.SIDEBAR_WIDTH_MOBILE};"
			{side}
		>
			<Sheet.Header class="sr-only">
				<Sheet.Title>{m.calm_raven_nest()}</Sheet.Title>
				<Sheet.Description>{m.dune_maple_shine()}</Sheet.Description>
			</Sheet.Header>
			<div class="flex h-full w-full flex-col">
				{@render children?.()}
			</div>
		</Sheet.Content>
	</Sheet.Root>
{:else}
	<div
		bind:this={ref}
		class="group peer hidden text-sidebar-foreground md:block"
		data-state={sidebar.state}
		data-collapsible={sidebar.state === "collapsed" ? collapsible : ""}
		data-variant={variant}
		data-side={side}
		data-position={position}
		data-slot="sidebar"
	>
		<!-- This is what handles the sidebar gap on desktop -->
		<div
			data-slot="sidebar-gap"
			class={cn(
				"relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
				"group-data-[collapsible=offcanvas]:w-0",
				"group-data-[side=right]:rotate-180",
				variant === "floating" || variant === "inset"
					? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
					: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
			)}
		></div>
		<div
			data-slot="sidebar-container"
			class={cn(
				"inset-y-0 z-10 hidden w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
				position === "viewport" ? "fixed h-svh" : "h-full",
				side === "left"
					? "inset-s-0 group-data-[collapsible=offcanvas]:-inset-s-(--sidebar-width)"
					: "inset-e-0 group-data-[collapsible=offcanvas]:-inset-e-(--sidebar-width)",
				// Adjust the padding for floating and inset variants.
				variant === "floating" || variant === "inset"
					? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
					: "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-e group-data-[side=right]:border-s",
				className
			)}
			{...restProps}
		>
			<div
				data-sidebar="sidebar"
				data-slot="sidebar-inner"
				class="relative flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
			>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
