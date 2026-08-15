<script lang="ts" module>
	import type { ToasterProps as SonnerProps } from "svelte-sonner";

	export type RootProps = SonnerProps;
</script>

<script lang="ts">
	import { Toaster as Sonner } from "svelte-sonner";
	import { mode } from "mode-watcher";

	import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon, LoaderIcon } from "$lib/icons";

	let { ...restProps }: RootProps = $props();
</script>

<Sonner
	theme={mode.current}
	class="toaster group"
	style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
	{...restProps}
>
	{#snippet loadingIcon()}
		<LoaderIcon class="size-4 animate-spin" />
	{/snippet}
	{#snippet successIcon()}
		<AlertSuccessIcon class="size-4" />
	{/snippet}
	{#snippet errorIcon()}
		<AlertErrorIcon class="size-4" />
	{/snippet}
	{#snippet infoIcon()}
		<AlertInfoIcon class="size-4" />
	{/snippet}
	{#snippet warningIcon()}
		<AlertWarningIcon class="size-4" />
	{/snippet}
</Sonner>
