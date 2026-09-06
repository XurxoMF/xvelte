<script lang="ts">
	import { untrack } from "svelte";
	import { afterNavigate } from "$app/navigation";
	import { asset, resolve } from "$app/paths";
	import { page } from "$app/state";
	import { ModeWatcher } from "mode-watcher";

	import type { Pathname } from "$app/types";
	import type { DocScope, DocUnit } from "./_docs/catalog";

	import "./layout.css";
	import { getUnit, navigation, scopes } from "./_docs/catalog";

	import { ChevronRightIcon, SearchIcon } from "$lib/icons";

	import { locales, localizeHref } from "$lib/paraglide/runtime";

	import * as Sidebar from "$lib/components/ui/sidebar";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as Command from "$lib/components/ui/command";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Sonner from "$lib/components/ui/sonner";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import * as ToggleGroup from "$lib/components/ui/toggle-group";

	let { children } = $props();

	const appIcon = asset("/favicon.png");
	let searchOpen = $state(false);
	let currentPath = $derived(page.url.pathname);
	let selectedScope = $state<DocScope>(
		untrack(() => getUnit(page.url.pathname)?.scope ?? (page.url.pathname.startsWith("/tauri") ? "tauri" : "shared"))
	);
	let expandedCategories = $state<Record<string, boolean>>({});
	let visibleCategories = $derived(navigation.find((scope) => scope.value === selectedScope)?.categories ?? []);

	/**
	 * Keeps one scope selected while leaving arrow-key navigation to ToggleGroup.
	 * @param event - Pointer or keyboard activation of a scope toggle.
	 * @param scope - The scope represented by the toggle.
	 */
	function preventScopeDeselection(event: MouseEvent | KeyboardEvent, scope: DocScope) {
		if (selectedScope === scope && (!("key" in event) || event.key === "Enter" || event.key === " ")) {
			event.preventDefault();
		}
	}

	/**
	 * Reveals the active destination and preserves other expanded categories for this session.
	 * @param unit - The documentation entry to reveal.
	 */
	function revealUnit(unit: DocUnit) {
		selectedScope = unit.scope;
		expandedCategories[`${unit.scope}:${unit.kind}`] = true;
	}

	// Route navigation, browser history, and search selections share the same sidebar state.
	afterNavigate(() => {
		const unit = getUnit(page.url.pathname);
		if (unit) revealUnit(unit);
		else if (page.url.pathname === "/tauri") selectedScope = "tauri";
		else {
			const scope = navigation.find((scope) =>
				scope.categories.some((category) => page.url.pathname === `${scope.value === "tauri" ? "/tauri" : ""}/${category.directory}`)
			);
			const category = scope?.categories.find((category) => page.url.pathname === `${scope.value === "tauri" ? "/tauri" : ""}/${category.directory}`);
			if (scope && category) {
				selectedScope = scope.value;
				expandedCategories[category.id] = true;
			}
		}
	});

	/**
	 * Closes global search and reveals the selected result, including the current page.
	 * @param unit - The selected documentation entry.
	 */
	function selectResult(unit: DocUnit) {
		revealUnit(unit);
		searchOpen = false;
	}
</script>

<ModeWatcher />

<Sonner.Root closeButton position="top-right" richColors />

<Tooltip.Provider delayDuration={500}>
	<Sidebar.Provider class="relative">
		<Sidebar.Root position="viewport" collapsible="offcanvas" variant="inset" class="border-r-0 bg-sidebar">
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

				<ToggleGroup.Root
					type="single"
					value={selectedScope}
					onValueChange={(value) => {
						if (value === "shared" || value === "tauri") selectedScope = value;
					}}
					aria-label="Documentation scope"
					variant="outline"
					class="w-full"
				>
					{#each scopes as scope (scope.value)}
						<ToggleGroup.Item
							value={scope.value}
							class="flex-1"
							onclick={(event) => preventScopeDeselection(event, scope.value)}
							onkeydown={(event) => preventScopeDeselection(event, scope.value)}
						>
							{scope.label}
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</Sidebar.Header>

			<Sidebar.Content>
				<Sidebar.Group>
					<Sidebar.GroupLabel>Getting started</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={currentPath === "/installation"} tooltipContent="Installation">
									{#snippet child({ props })}<a
											href={resolve("/installation")}
											aria-current={currentPath === "/installation" ? "page" : undefined}
											{...props}>Installation</a
										>{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>

				<Sidebar.Group>
					<Sidebar.GroupLabel>{scopes.find((scope) => scope.value === selectedScope)?.label}</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						{#each visibleCategories as category (category.id)}
							<Collapsible.Root
								open={expandedCategories[category.id] ?? category.units.some((unit) => unit.href === currentPath)}
								onOpenChange={(open) => (expandedCategories[category.id] = open)}
							>
								<Collapsible.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuButton {...props} class="group/category">
											<ChevronRightIcon aria-hidden="true" class="transition-transform group-aria-expanded/category:rotate-90" />
											<span>{category.label}</span>
											<span class="ml-auto text-xs text-muted-foreground">{category.units.length}</span>
										</Sidebar.MenuButton>
									{/snippet}
								</Collapsible.Trigger>

								<Collapsible.Content>
									<Sidebar.MenuSub>
										{#each category.units as unit (unit.href)}
											<Sidebar.MenuSubItem>
												<Sidebar.MenuSubButton
													href={resolve(unit.href as Pathname)}
													isActive={currentPath === unit.href}
													aria-current={currentPath === unit.href ? "page" : undefined}
												>
													{unit.title}
												</Sidebar.MenuSubButton>
											</Sidebar.MenuSubItem>
										{/each}
									</Sidebar.MenuSub>
								</Collapsible.Content>
							</Collapsible.Root>
						{/each}
					</Sidebar.GroupContent>
				</Sidebar.Group>
			</Sidebar.Content>

			<Sidebar.Footer id="sidebar-footer" class="border-t px-4 py-3">
				<Dialog.Root bind:open={searchOpen}>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton {...props}>
								<SearchIcon aria-hidden="true" />
								<span>Search</span>
							</Sidebar.MenuButton>
						{/snippet}
					</Dialog.Trigger>

					<Dialog.Content class="gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
						<Dialog.Header class="sr-only">
							<Dialog.Title>Search documentation</Dialog.Title>
							<Dialog.Description>Find a page and press Enter to open it.</Dialog.Description>
						</Dialog.Header>

						<Command.Root label="Documentation search">
							<Command.Input placeholder="Search documentation…" aria-label="Search documentation" class="pr-10" />

							<Command.List aria-label="Documentation pages" class="max-h-[min(24rem,60svh)]">
								<Command.Empty>No documentation found.</Command.Empty>

								<Command.Group heading="Getting started">
									<Command.LinkItem value="installation" href={resolve("/installation")} onSelect={() => (searchOpen = false)}>
										Installation
									</Command.LinkItem>
								</Command.Group>

								{#each navigation as scope (scope.value)}
									{#each scope.categories as category (category.id)}
										<Command.Group heading={`${scope.label} - ${category.label}`}>
											{#each category.units as unit (unit.href)}
												<Command.LinkItem
													value={unit.href}
													keywords={[unit.title, unit.slug, scope.label, category.label, unit.description]}
													href={resolve(unit.href as Pathname)}
													onSelect={() => selectResult(unit)}
												>
													{unit.title}
												</Command.LinkItem>
											{/each}
										</Command.Group>
									{/each}
								{/each}
							</Command.List>
						</Command.Root>
					</Dialog.Content>
				</Dialog.Root>
			</Sidebar.Footer>

			<Sidebar.Rail />
		</Sidebar.Root>

		<Sidebar.Inset style="--header-height: calc(var(--spacing) * 16)">
			<header class="flex h-(--header-height) shrink-0 items-center gap-3 border-b px-4 sm:px-6">
				<Sidebar.Trigger />
				<div class="h-4 w-px bg-border"></div>
				<a href={resolve("/")} class="text-sm font-medium">Documentation</a>
				<a href="https://github.com/XurxoMF/xvelte" class="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground">GitHub</a>
			</header>

			{@render children()}
		</Sidebar.Inset>
	</Sidebar.Provider>
</Tooltip.Provider>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
