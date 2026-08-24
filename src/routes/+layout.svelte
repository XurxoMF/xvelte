<script lang="ts">
	import type { Pathname } from "$app/types";
	import { asset, resolve } from "$app/paths";
	import { page } from "$app/state";

	import "./layout.css";

	import { attachments, components, hooks } from "./_docs/catalog";

	import { locales, localizeHref } from "$lib/paraglide/runtime";

	import { SearchIcon } from "$lib/icons";

	import { ModeWatcher } from "mode-watcher";

	import * as Sidebar from "$lib/components/ui/sidebar";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as Typography from "$lib/components/ui/typography";
	import * as Sonner from "$lib/components/ui/sonner";
	import * as ScrollArea from "$lib/components/ui/scroll-area";

	let { children } = $props();

	const appIcon = asset("/favicon.png");
	const categories = [
		{ href: "/components", label: "Components", units: components },
		{ href: "/hooks", label: "Hooks", units: hooks },
		{ href: "/attachments", label: "Attachments", units: attachments }
	];

	let query = $state("");
	let normalizedQuery = $derived(query.toLowerCase().trim());
	let filteredCategories = $derived(
		categories
			.map((category) => ({
				...category,
				units: category.units.filter((unit) => unit.title.toLowerCase().includes(normalizedQuery))
			}))
			.filter((category) => category.units.length > 0)
	);

	let currentPath = $derived(page.url.pathname);
</script>

<ModeWatcher />

<Sonner.Root closeButton position="top-right" richColors />

<Tooltip.Provider delayDuration={500}>
	<Sidebar.Provider class="relative">
		<Sidebar.Root collapsible="offcanvas" variant="inset" class="border-r-0 bg-sidebar md:absolute">
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
					<span class="sr-only">Filter documentation</span>
					<SearchIcon class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
					<Sidebar.Input bind:value={query} type="search" placeholder="Filter documentation…" class="pl-8" />
				</label>
			</Sidebar.Header>

			<Sidebar.Content>
				<Sidebar.Group>
					<Sidebar.GroupLabel>Explore</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each categories as category (category.href)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										isActive={currentPath === category.href || currentPath.startsWith(`${category.href}/`)}
										tooltipContent={category.label}
									>
										{#snippet child({ props })}<a href={resolve(category.href as Pathname)} {...props}
												><span>{category.label}</span><span class="ml-auto text-xs text-muted-foreground">{category.units.length}</span></a
											>{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>

				{#each filteredCategories as category (category.href)}
					<Sidebar.Group>
						<Sidebar.GroupLabel>{category.label}</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								{#each category.units as unit (unit.href)}
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
				{/each}
			</Sidebar.Content>

			<Sidebar.Footer id="sidebar-footer" class="border-t px-4 py-3">
				<Typography.P class="text-muted-foreground">Built from the library it documents.</Typography.P>
			</Sidebar.Footer>

			<Sidebar.Rail />
		</Sidebar.Root>

		<Sidebar.Inset class="overflow-hidden bg-background" style="--header-height: calc(var(--spacing) * 16)">
			<header class="flex h-(--header-height) shrink-0 items-center gap-3 border-b px-4 sm:px-6">
				<Sidebar.Trigger />
				<div class="h-4 w-px bg-border"></div>
				<a href={resolve("/")} class="text-sm font-medium">Documentation</a>
				<a href="https://github.com/XurxoMF/xvelte" class="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground">GitHub</a>
			</header>

			<ScrollArea.Root class="h-[calc(100%-var(--header-height))]">
				<ScrollArea.Viewport>
					{@render children()}
				</ScrollArea.Viewport>

				<ScrollArea.ScrollbarVertical />
			</ScrollArea.Root>
		</Sidebar.Inset>
	</Sidebar.Provider>
</Tooltip.Provider>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
