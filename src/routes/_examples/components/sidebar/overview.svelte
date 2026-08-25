<script lang="ts">
	import { EllipsisIcon, FileIcon, FolderIcon, FolderOpenIcon, PlusIcon, PreferencesIcon, SearchIcon, StarIcon } from "$lib/icons";

	import * as Sidebar from "$lib/components/ui/sidebar";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as Typography from "$lib/components/ui/typography";

	const links = [
		{ href: "/dashboard", label: "Overview", icon: FileIcon, active: true },
		{ href: "/projects", label: "Projects", icon: FolderIcon, badge: "8" },
		{ href: "/favorites", label: "Favorites", icon: StarIcon },
		{ href: "/settings", label: "Settings", icon: PreferencesIcon }
	];

	const metrics = [
		{ label: "Active projects", value: "8", detail: "+2 this month", icon: FolderIcon },
		{ label: "Open tasks", value: "24", detail: "6 due this week", icon: FileIcon },
		{ label: "Favorites", value: "12", detail: "Across 4 projects", icon: StarIcon }
	];
</script>

<div class="h-160 overflow-hidden rounded-md border">
	<Tooltip.Provider delayDuration={300}>
		<Sidebar.Provider>
			<Sidebar.Root collapsible="icon">
				<Sidebar.Header>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton size="lg" tooltipContent="Northstar workspace">
								{#snippet child({ props })}
									<a {...props}>
										<span class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
											<FolderOpenIcon />
										</span>
										<span class="grid min-w-0 flex-1 text-left leading-tight">
											<span class="truncate font-semibold">Northstar</span>
											<span class="truncate text-muted-foreground">Product team</span>
										</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>

							<Sidebar.MenuAction type="button" aria-label="Workspace options">
								<EllipsisIcon />
							</Sidebar.MenuAction>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.Header>

				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
						<Sidebar.GroupAction type="button" aria-label="Create project">
							<PlusIcon />
						</Sidebar.GroupAction>

						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton tooltipContent="Search">
										<SearchIcon />
										<span>Search</span>
									</Sidebar.MenuButton>
									<Sidebar.MenuBadge>⌘K</Sidebar.MenuBadge>
								</Sidebar.MenuItem>

								{#each links as link (link.href)}
									{@const Icon = link.icon}
									<Sidebar.MenuItem>
										<Sidebar.MenuButton isActive={link.active} tooltipContent={link.label}>
											{#snippet child({ props })}
												<a aria-current={link.active ? "page" : undefined} {...props}>
													<Icon />
													<span>{link.label}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>

										{#if link.badge}
											<Sidebar.MenuBadge>{link.badge}</Sidebar.MenuBadge>
										{/if}

										{#if link.href === "/projects"}
											<Sidebar.MenuSub>
												<Sidebar.MenuSubItem>
													<Sidebar.MenuSubButton isActive>Website redesign</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
												<Sidebar.MenuSubItem>
													<Sidebar.MenuSubButton>Mobile app</Sidebar.MenuSubButton>
												</Sidebar.MenuSubItem>
											</Sidebar.MenuSub>
										{/if}
									</Sidebar.MenuItem>
								{/each}
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>

				<Sidebar.Footer>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton size="lg" tooltipContent="Alex Morgan">
								<span class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/15 font-semibold text-primary">AM</span>
								<span class="grid min-w-0 flex-1 text-left leading-tight">
									<span class="truncate font-medium">Alex Morgan</span>
									<span class="truncate text-muted-foreground">alex@example.com</span>
								</span>
							</Sidebar.MenuButton>

							<Sidebar.MenuAction type="button" aria-label="Account options">
								<EllipsisIcon />
							</Sidebar.MenuAction>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.Footer>
				<Sidebar.Rail />
			</Sidebar.Root>

			<Sidebar.Inset>
				<header class="flex h-12 shrink-0 items-center gap-2 border-b px-4">
					<Sidebar.Trigger />
					<span class="h-4 w-px bg-border" aria-hidden="true"></span>
					<Typography.P class="font-medium">Overview</Typography.P>
					<span class="ms-auto rounded-full bg-primary/10 px-2 py-1 text-primary">All systems operational</span>
				</header>

				<main class="min-h-0 flex-1 overflow-auto p-5">
					<div class="mx-auto max-w-4xl space-y-5">
						<div>
							<Typography.H3>Good morning, Alex</Typography.H3>
							<Typography.P class="text-muted-foreground">Here is what is happening across your workspace today.</Typography.P>
						</div>

						<div class="grid gap-3 sm:grid-cols-3">
							{#each metrics as metric (metric.label)}
								{@const Icon = metric.icon}
								<section class="rounded-lg border bg-card p-4 shadow-xs">
									<div class="mb-3 flex items-center justify-between">
										<span class="rounded-md bg-primary/10 p-2 text-primary"><Icon class="size-4" /></span>
										<Typography.P class="font-semibold">{metric.value}</Typography.P>
									</div>
									<Typography.H6>{metric.label}</Typography.H6>
									<Typography.P class="text-muted-foreground">{metric.detail}</Typography.P>
								</section>
							{/each}
						</div>

						<section class="rounded-lg border bg-card p-4 shadow-xs">
							<div class="mb-3 flex items-center justify-between gap-3">
								<div>
									<Typography.H5>Recent activity</Typography.H5>
									<Typography.P class="text-muted-foreground">The latest updates from your team.</Typography.P>
								</div>
								<EllipsisIcon class="size-4 text-muted-foreground" aria-hidden="true" />
							</div>

							<div class="space-y-2">
								<div class="flex items-center gap-3 rounded-md bg-muted/50 p-3">
									<FolderOpenIcon class="size-4 shrink-0 text-primary" />
									<Typography.P><span class="font-medium">Maya</span> moved Website redesign to review.</Typography.P>
								</div>
								<div class="flex items-center gap-3 rounded-md bg-muted/50 p-3">
									<StarIcon class="size-4 shrink-0 text-primary" />
									<Typography.P><span class="font-medium">Leo</span> starred the Q4 roadmap.</Typography.P>
								</div>
							</div>
						</section>
					</div>
				</main>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</Tooltip.Provider>
</div>
