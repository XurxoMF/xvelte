<script lang="ts">
	import type { Pathname } from "$app/types";
	import { asset, resolve } from "$app/paths";
	import { page } from "$app/state";

	import "./layout.css";
	import "./custom.css";

	import { attachments, components, hooks } from "./_docs/catalog";

	import { locales, localizeHref } from "$lib/paraglide/runtime";

	import { SearchIcon } from "$lib/icons";

	import { ModeWatcher } from "mode-watcher";

	import * as Sidebar from "$lib/components/ui/sidebar";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as Typography from "$lib/components/ui/typography";
	import * as Sonner from "$lib/components/ui/sonner";

	let { children } = $props();

	const appIcon = asset("/favicon.png");

	let query = $state("");

	let filteredComponents = $derived(components.filter((unit) => unit.title.toLowerCase().includes(query.toLowerCase().trim())));

	let currentPath = $derived(page.url.pathname);
</script>

<ModeWatcher />
<Sonner.Root />

<Tooltip.Provider delayDuration={500}>
	<Sidebar.Provider class="relative" style="--sidebar-width: 17rem;">
		<Sidebar.Root collapsible="offcanvas" class="border-r-0 bg-sidebar md:absolute">
			<Sidebar.Header id="sidebar-header" class="gap-3 border-b px-4 py-4">
				<a href={resolve("/")} class="group flex items-center gap-3" aria-label="xvelte home">
					<img
						src={appIcon}
						alt=""
						width="36"
						height="36"
						class="size-9 rounded-xl border-2 border-primary object-cover shadow-md shadow-primary/50"
					/>
					<span>
						<strong class="block leading-none tracking-tight">xvelte</strong>
						<span class="text-xs text-muted-foreground">Svelte 5 collection</span>
					</span>
				</a>

				<label class="relative block">
					<span class="sr-only">Filter components</span>
					<SearchIcon class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
					<Sidebar.Input bind:value={query} type="search" placeholder="Filter components…" class="pl-8" />
				</label>
			</Sidebar.Header>

			<Sidebar.Content>
				<Sidebar.Group>
					<Sidebar.GroupLabel>Explore</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each [{ href: "/components", label: "Components", count: components.length }, { href: "/hooks", label: "Hooks", count: hooks.length }, { href: "/attachments", label: "Attachments", count: attachments.length }] as item (item.href)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={currentPath === item.href} tooltipContent={item.label}>
										{#snippet child({ props })}<a href={resolve(item.href as Pathname)} {...props}
												><span>{item.label}</span><span class="ml-auto text-xs text-muted-foreground">{item.count}</span></a
											>{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>

				<Sidebar.Group>
					<Sidebar.GroupLabel>{query ? "Results" : "Components"}</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each filteredComponents as unit (unit.slug)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={currentPath === unit.href} tooltipContent={unit.title}>
										{#snippet child({ props })}<a
												href={resolve(unit.href as Pathname)}
												aria-current={currentPath === unit.href ? "page" : undefined}
												{...props}>{unit.title}</a
											>{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			</Sidebar.Content>

			<Sidebar.Footer id="sidebar-footer" class="border-t px-4 py-3">
				<Typography.P class="text-muted-foreground">Built from the library it documents.</Typography.P>
			</Sidebar.Footer>
			<Sidebar.Rail />
		</Sidebar.Root>

		<Sidebar.Inset class="min-w-0 overflow-hidden bg-background">
			<header class="flex h-14 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
				<Sidebar.Trigger />
				<div class="h-4 w-px bg-border"></div>
				<a href={resolve("/")} class="text-sm font-medium">Documentation</a>
				<a href="https://github.com/XurxoMF/xvelte" class="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground">GitHub</a>
			</header>

			<div class="min-h-0 flex-1 overflow-y-auto">{@render children()}</div>
		</Sidebar.Inset>
	</Sidebar.Provider>
</Tooltip.Provider>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
