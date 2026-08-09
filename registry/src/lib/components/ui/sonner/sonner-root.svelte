<script lang="ts" module>
	export type RootProps = SonnerProps;
</script>

<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";

	import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon, LoaderIcon } from "$lib/icons";

	import { App } from "$lib/classes/App.svelte";

	let { ...restProps }: RootProps = $props();
</script>

<Sonner
	theme={App.config.theme}
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
