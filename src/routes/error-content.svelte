<script lang="ts">
	import { resolve } from "$app/paths";

	import * as Button from "$lib/components/ui/button";
	import * as Typography from "$lib/components/ui/typography";

	let { status }: { status: number } = $props();

	const notFound = $derived(status === 404);
	const title = $derived(notFound ? "Page not found" : "Something did not go as planned");
	const description = $derived(
		notFound ? "The route you are looking for does not exist or has moved." : "There was a problem loading this page. Return home and try again."
	);
</script>

<svelte:head>
	<title>{notFound ? "Page not found" : "Error"} - xvelte</title>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="relative isolate flex min-h-[calc(100svh-var(--header-height))] items-center overflow-hidden px-5 py-20 sm:px-8">
	<div class="docs-grid-mask pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

	<div class="mx-auto w-full max-w-3xl text-center">
		<Typography.P class="font-mono text-sm font-semibold tracking-[0.3em] text-primary uppercase">Error {status}</Typography.P>
		<Typography.H1 class="mt-5 text-4xl sm:text-6xl">{title}</Typography.H1>
		<Typography.Leading class="mx-auto mt-6 max-w-2xl">{description}</Typography.Leading>

		<div class="mt-10 flex justify-center">
			<a href={resolve("/")} class={Button.rootVariants({ size: "lg" })}>Back to home</a>
		</div>
	</div>
</div>
