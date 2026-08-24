<script lang="ts" module>
	import type { ToasterProps as SonnerProps } from "svelte-sonner";

	export type RootProps = SonnerProps;
</script>

<script lang="ts">
	import { Toaster as Sonner } from "svelte-sonner";
	import { mode } from "mode-watcher";

	import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon, LoaderIcon } from "$lib/icons";

	let { toastOptions, ...restProps }: RootProps = $props();
</script>

<Sonner
	theme={mode.current}
	class="toaster group"
	style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border); --error-bg: color-mix(in oklab, var(--color-danger) 10%, var(--color-popover)); --error-text: var(--color-danger); --error-border: color-mix(in oklab, var(--color-danger) 30%, var(--color-border)); --warning-bg: color-mix(in oklab, var(--color-warning) 10%, var(--color-popover)); --warning-text: var(--color-warning); --warning-border: color-mix(in oklab, var(--color-warning) 30%, var(--color-border)); --success-bg: color-mix(in oklab, var(--color-success) 10%, var(--color-popover)); --success-text: var(--color-success); --success-border: color-mix(in oklab, var(--color-success) 30%, var(--color-border)); --info-bg: color-mix(in oklab, var(--color-info) 10%, var(--color-popover)); --info-text: var(--color-info); --info-border: color-mix(in oklab, var(--color-info) 30%, var(--color-border));"
	toastOptions={{
		...toastOptions,
		classes: {
			success: "border-success/30!",
			info: "border-info/30!",
			warning: "border-warning/30!",
			error: "border-danger/30!",
			...toastOptions?.classes
		}
	}}
	{...restProps}
>
	{#snippet loadingIcon()}
		<LoaderIcon class="size-4 animate-spin" />
	{/snippet}
	{#snippet successIcon()}
		<AlertSuccessIcon class="size-4 text-success" />
	{/snippet}
	{#snippet errorIcon()}
		<AlertErrorIcon class="size-4 text-danger" />
	{/snippet}
	{#snippet infoIcon()}
		<AlertInfoIcon class="size-4 text-info" />
	{/snippet}
	{#snippet warningIcon()}
		<AlertWarningIcon class="size-4 text-warning" />
	{/snippet}
</Sonner>
