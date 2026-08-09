<script lang="ts" module>
	export type RootProps = SonnerProps;
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";

	import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon, LoaderIcon } from "$lib/icons";

	let { theme: themeProp, ...restProps }: RootProps = $props();

	let rootTheme = $state<"light" | "dark">("light");
	const theme = $derived(themeProp ?? rootTheme);

	onMount(() => {
		const root = document.documentElement;
		const updateTheme = () => (rootTheme = root.classList.contains("dark") ? "dark" : "light");
		const observer = new MutationObserver(updateTheme);

		updateTheme();
		observer.observe(root, { attributes: true, attributeFilter: ["class"] });

		return () => observer.disconnect();
	});
</script>

<Sonner
	{theme}
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
