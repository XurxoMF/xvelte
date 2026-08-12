<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { locales, localizeHref } from "$lib/paraglide/runtime";
	import "./layout.css";
	import { ModeWatcher } from "mode-watcher";
	import * as Tooltip from "$lib/components/ui/tooltip";

	let { children } = $props();
</script>

<ModeWatcher />

<Tooltip.Provider delayDuration={500}>{@render children()}</Tooltip.Provider>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
