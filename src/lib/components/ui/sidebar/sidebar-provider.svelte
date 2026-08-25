<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils";

	export type ProviderProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean | undefined;
		onOpenChange?: ((open: boolean) => void) | undefined;
	};
</script>

<script lang="ts">
	import * as Sidebar from ".";

	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		open = $bindable(true),
		onOpenChange = () => {},
		class: className,
		style,
		children,
		...restProps
	}: ProviderProps = $props();

	const sidebar = Sidebar.setSidebarContext({
		get open() {
			return open;
		},
		set open(value: boolean) {
			open = value;
			onOpenChange(value);

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${Sidebar.SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${Sidebar.SIDEBAR_COOKIE_MAX_AGE}`;
		}
	});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<div
	data-slot="sidebar-provider"
	style="--sidebar-width: {Sidebar.SIDEBAR_WIDTH}; --sidebar-width-icon: {Sidebar.SIDEBAR_WIDTH_ICON}; {style}"
	class={cn(
		"group/sidebar-provider flex h-full w-full has-data-[position=viewport]:h-auto has-data-[position=viewport]:min-h-svh has-data-[variant=inset]:bg-sidebar",
		className
	)}
	bind:this={ref}
	{...restProps}
>
	{@render children?.()}
</div>
