<script lang="ts">
	import * as NavigationMenu from "$lib/components/ui/navigation-menu";
</script>

<NavigationMenu.Root aria-label="Primary">
	<NavigationMenu.List>
		<NavigationMenu.Item value="resources">
			<NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>

			<NavigationMenu.Content>
				<ul class="grid w-80 gap-1">
					<li>
						<NavigationMenu.Link href="#" class="flex-col items-start">
							<div class="font-medium">Guides</div>
							<div class="text-sm opacity-70">Step-by-step help for common workflows.</div>
						</NavigationMenu.Link>
					</li>
					<li>
						<NavigationMenu.Link href="#" class="flex-col items-start">
							<div class="font-medium">API reference</div>
							<div class="text-sm opacity-70">Detailed documentation for every endpoint.</div>
						</NavigationMenu.Link>
					</li>
				</ul>
			</NavigationMenu.Content>
		</NavigationMenu.Item>

		<NavigationMenu.Item>
			<NavigationMenu.Link href="#">Pricing</NavigationMenu.Link>
		</NavigationMenu.Item>

		<NavigationMenu.Indicator />
	</NavigationMenu.List>
</NavigationMenu.Root>
