<script lang="ts">
	import type { Pathname } from "$app/types";
	import { resolve } from "$app/paths";
	import * as Sidebar from "$lib/components/ui/sidebar";

	const links = [
		{ href: "/dashboard", label: "Dashboard", icon: "D" },
		{ href: "/projects", label: "Projects", icon: "P" },
		{ href: "/settings", label: "Settings", icon: "S" }
	];
</script>

<Sidebar.Provider>
	<Sidebar.Root collapsible="icon">
		<Sidebar.Header>
			<strong class="px-2">Workspace</strong>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each links as link (link.href)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton tooltipContent={link.label}>
									{#snippet child({ props })}
										<a href={resolve(link.href as Pathname)} {...props}>
											<span aria-hidden="true">{link.icon}</span>
											<span>{link.label}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer>Signed in</Sidebar.Footer>
		<Sidebar.Rail />
	</Sidebar.Root>

	<Sidebar.Inset>
		<header class="flex h-12 items-center gap-2 border-b px-4">
			<Sidebar.Trigger />
			<h1>Dashboard</h1>
		</header>

		<main class="min-h-0 flex-1 overflow-auto p-4">Application content</main>
	</Sidebar.Inset>
</Sidebar.Provider>
