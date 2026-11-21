<script lang="ts">
	import { resolve } from "$app/paths";

	import tauriLayout from "../examples/web-tauri/layout.ts.txt?raw";
	import tauriScripts from "../examples/web-tauri/scripts.json.txt?raw";
	import tauriBuildConfig from "../examples/web-tauri/tauri-build.json.txt?raw";
	import tauriViteConfig from "../examples/web-tauri/vite.config.ts.txt?raw";
	import CommandBlock from "../_components/command-block.svelte";
	import SourceBlock from "../_components/source-block.svelte";

	import { AlertInfoIcon, AlertWarningIcon } from "#lib/icons.ts";

	import * as Alert from "#lib/components/ui/alert/index.ts";
	import * as FloatingMenu from "#lib/components/ui/floating-menu/index.ts";
	import * as ToggleGroup from "#lib/components/ui/toggle-group/index.ts";
	import * as Typography from "#lib/components/ui/typography/index.ts";

	type PackageManager = "bun" | "npm" | "pnpm";

	const commands = {
		bun: {
			addRuntime: "bun add @tauri-apps/api @tauri-apps/plugin-fs",
			addDevelopment: "bun add -D @sveltejs/adapter-static @tauri-apps/cli",
			removeBun: "bun remove @sveltejs/adapter-bun",
			removeNode: "bun remove @sveltejs/adapter-node",
			run: "bun tauri dev",
			build: "bun tauri build",
			beforeDev: "bun run dev:tauri",
			beforeBuild: "bun run build:tauri"
		},
		npm: {
			addRuntime: "npm install @tauri-apps/api @tauri-apps/plugin-fs",
			addDevelopment: "npm install -D @sveltejs/adapter-static @tauri-apps/cli",
			removeBun: "npm uninstall @sveltejs/adapter-bun",
			removeNode: "npm uninstall @sveltejs/adapter-node",
			run: "npm run tauri dev",
			build: "npm run tauri build",
			beforeDev: "npm run dev:tauri",
			beforeBuild: "npm run build:tauri"
		},
		pnpm: {
			addRuntime: "pnpm add @tauri-apps/api @tauri-apps/plugin-fs",
			addDevelopment: "pnpm add -D @sveltejs/adapter-static @tauri-apps/cli",
			removeBun: "pnpm remove @sveltejs/adapter-bun",
			removeNode: "pnpm remove @sveltejs/adapter-node",
			run: "pnpm tauri dev",
			build: "pnpm tauri build",
			beforeDev: "pnpm dev:tauri",
			beforeBuild: "pnpm build:tauri"
		}
	} satisfies Record<PackageManager, Record<string, string>>;

	const findLatestRelease =
		"XVELTE_RELEASE=$(curl -fsSL https://api.github.com/repos/XurxoMF/xvelte/releases/latest | grep '\"tag_name\"' | cut -d '\"' -f 4)";
	const cloneRelease = 'git clone --depth 1 --branch "$XVELTE_RELEASE" https://github.com/XurxoMF/xvelte.git .xvelte-source';
	const copyTauriLibrary = "cp -R .xvelte-source/src/lib/tauri src/lib/tauri";
	const copyTauriApplication = "cp -R .xvelte-source/src-tauri ./src-tauri";
	const removeSource = "rm -rf .xvelte-source";
	let packageManager: PackageManager = $state("bun");
	let selectedTauriBuildConfig = $derived(
		tauriBuildConfig
			.replace("bun run dev:tauri", commands[packageManager].beforeDev)
			.replace("bun run build:tauri", commands[packageManager].beforeBuild)
	);

	/** Keeps the package-manager selector from entering an empty single-selection state. */
	function selectPackageManager(value: string) {
		if (value === "bun" || value === "npm" || value === "pnpm") packageManager = value;
	}
</script>

<svelte:head>
	<title>Add Tauri to an xvelte web project</title>
	<meta name="description" content="Migrate an existing SSR, SSG, or web SPA xvelte project to one SPA shared by web and Tauri." />
</svelte:head>

<main class="mx-auto w-full max-w-5xl px-5 pt-10 pb-28 sm:px-8 sm:pt-14">
	<a href={resolve("/installation")} class="text-sm font-medium text-primary underline-offset-4 hover:underline">← All installation paths</a>

	<header class="mt-6 max-w-3xl">
		<Typography.P class="font-medium text-primary">Migration guide</Typography.P>
		<Typography.H1>Move from Web to Web SPA + Tauri SPA</Typography.H1>
		<Typography.Leading>
			Convert the existing website to one client-rendered SvelteKit application, preserve the reusable xvelte library, and add the native shell.
		</Typography.Leading>
	</header>

	<Alert.Root variant="warning" role="status" class="mt-8">
		<AlertWarningIcon aria-hidden="true" />
		<Alert.Title>Commit or back up the project first</Alert.Title>
		<Alert.Description>
			This migration replaces the rendering model and core configuration. Keep a recoverable baseline before copying files.
		</Alert.Description>
	</Alert.Root>

	<div class="mt-14 space-y-12">
		<section class="space-y-4" aria-labelledby="understand-losses">
			<Typography.H2 id="understand-losses">1. Understand what changes</Typography.H2>
			<div class="overflow-x-auto rounded-xl border">
				<table class="w-full min-w-2xl text-left text-sm">
					<thead class="border-b bg-muted/50">
						<tr><th class="p-4">Current model</th><th class="p-4">What changes</th><th class="p-4">Required response</th></tr>
					</thead>
					<tbody class="divide-y">
						<tr>
							<th class="p-4 align-top">Web SSR</th><td class="p-4 align-top">
								No request-time HTML, server actions, private environment access, or server-only loads.
							</td><td class="p-4 align-top">Move backend work to an external API or validated Tauri commands.</td>
						</tr>
						<tr>
							<th class="p-4 align-top">Web SSG</th><td class="p-4 align-top">No generated content HTML or build-time route crawling.</td><td
								class="p-4 align-top"
							>
								Load public data in the browser and accept the SEO tradeoff.
							</td>
						</tr>
						<tr>
							<th class="p-4 align-top">Web SPA</th><td class="p-4 align-top">The rendering model stays the same.</td><td class="p-4 align-top">
								Add the native target and audit browser-only APIs for Tauri.
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section class="space-y-4" aria-labelledby="audit-server-code">
			<Typography.H2 id="audit-server-code">2. Audit server-only code</Typography.H2>
			<Typography.P class="text-muted-foreground">
				Search before changing configuration. A full SPA cannot execute these application-server features:
			</Typography.P>
			<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
				<li>
					<Typography.InlineCode>+page.server.ts</Typography.InlineCode>, <Typography.InlineCode>+layout.server.ts</Typography.InlineCode>, and form
					actions.
				</li>
				<li><Typography.InlineCode>+server.ts</Typography.InlineCode> endpoints required by the UI.</li>
				<li>Private environment imports, database clients, filesystem access, secrets, and server hooks.</li>
				<li>Loads that assume trusted execution or depend on request headers and cookies unavailable to the browser.</li>
			</ul>
			<Alert.Root variant="info">
				<AlertInfoIcon aria-hidden="true" />
				<Alert.Title>Runtime detection is not authorization</Alert.Title>
				<Alert.Description>
					Tauri capabilities and Rust-side validation must protect native operations. Do not rely on a frontend platform check as a security boundary.
				</Alert.Description>
			</Alert.Root>
		</section>

		<section class="space-y-4" aria-labelledby="replace-packages">
			<Typography.H2 id="replace-packages">3. Replace the adapter and install Tauri</Typography.H2>
			<Typography.P class="text-muted-foreground">
				If the project currently uses an SSR adapter, run the matching removal command. A current Web SPA or SSG project can skip both removals.
			</Typography.P>
			<CommandBlock title="Remove the Bun adapter when installed" code={commands[packageManager].removeBun} />
			<CommandBlock title="Remove the Node adapter when installed" code={commands[packageManager].removeNode} />
			<CommandBlock title="Install Tauri runtime packages" code={commands[packageManager].addRuntime} />
			<CommandBlock title="Install the static adapter and Tauri CLI" code={commands[packageManager].addDevelopment} />
		</section>

		<section class="space-y-4" aria-labelledby="copy-native-files">
			<Typography.H2 id="copy-native-files">4. Copy the native files</Typography.H2>
			<CommandBlock title="Find the latest release" code={findLatestRelease} />
			<CommandBlock title="Clone that release" code={cloneRelease} />
			<CommandBlock title="Frontend Tauri helpers" code={copyTauriLibrary} />
			<CommandBlock title="Tauri application" code={copyTauriApplication} />
		</section>

		<section class="space-y-4" aria-labelledby="replace-configuration">
			<Typography.H2 id="replace-configuration">5. Replace the shared configuration</Typography.H2>
			<SourceBlock title="vite.config.ts" code={tauriViteConfig} language="typescript" />
			<SourceBlock title="src/routes/+layout.ts" code={tauriLayout} language="typescript" />
			<Typography.P class="text-muted-foreground">
				Merge the scripts object rather than replacing the whole <Typography.InlineCode>package.json</Typography.InlineCode>.
			</Typography.P>
			<SourceBlock title="package.json" code={tauriScripts} language="json" />
			<Typography.P class="text-muted-foreground">
				Merge the build object and preserve project-specific window, capability, bundle, product, and identifier settings.
			</Typography.P>
			<SourceBlock title="src-tauri/tauri.conf.json" code={selectedTauriBuildConfig} language="json" />
		</section>

		<section class="space-y-4" aria-labelledby="verify-migration">
			<Typography.H2 id="verify-migration">6. Verify both targets</Typography.H2>
			<Typography.P class="text-muted-foreground">
				Run the web build, the repository checks, and the native app. Test deep links and refreshes in the deployed website as well as navigation
				inside Tauri.
			</Typography.P>
			<CommandBlock title="Start Tauri" code={commands[packageManager].run} />
			<CommandBlock title="Build the native application" code={commands[packageManager].build} />
			<CommandBlock title="Remove the temporary clone after verification" code={removeSource} />
		</section>
	</div>

	<FloatingMenu.Root position="bottom-right" class="fixed">
		<FloatingMenu.Group role="group" aria-label="Migration package manager">
			<span class="px-2 text-xs font-medium text-muted-foreground">Packages</span>
			<ToggleGroup.Root
				type="single"
				value={packageManager}
				onValueChange={selectPackageManager}
				variant="outline"
				size="sm"
				aria-label="Choose a package manager"
			>
				<ToggleGroup.Item value="bun">Bun</ToggleGroup.Item><ToggleGroup.Item value="npm">npm</ToggleGroup.Item><ToggleGroup.Item value="pnpm">
					pnpm
				</ToggleGroup.Item>
			</ToggleGroup.Root>
		</FloatingMenu.Group>
	</FloatingMenu.Root>
</main>
