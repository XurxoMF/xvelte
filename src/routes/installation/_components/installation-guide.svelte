<script lang="ts" module>
	import type { InstallationGuideSlug } from "../_data";

	export type InstallationGuideProps = { kind: InstallationGuideSlug };
	type PackageManager = "bun" | "npm" | "pnpm";
	type ServerRuntime = "bun" | "node";
</script>

<script lang="ts">
	import { resolve } from "$app/paths";

	import rootLayout from "../examples/common/root-layout.svelte.txt?raw";
	import staticScripts from "../examples/static-scripts.json.txt?raw";
	import ssgLayout from "../examples/web-ssg/layout.ts.txt?raw";
	import ssgViteConfig from "../examples/web-ssg/vite.config.ts.txt?raw";
	import spaLayout from "../examples/web-spa/layout.ts.txt?raw";
	import spaViteConfig from "../examples/web-spa/vite.config.ts.txt?raw";
	import ssrLayout from "../examples/web-ssr/layout.ts.txt?raw";
	import ssrBunScripts from "../examples/web-ssr/scripts-bun.json.txt?raw";
	import ssrBunViteConfig from "../examples/web-ssr/vite-bun.config.ts.txt?raw";
	import ssrNodeScripts from "../examples/web-ssr/scripts-node.json.txt?raw";
	import ssrNodeViteConfig from "../examples/web-ssr/vite-node.config.ts.txt?raw";
	import tauriLayout from "../examples/web-tauri/layout.ts.txt?raw";
	import tauriScripts from "../examples/web-tauri/scripts.json.txt?raw";
	import tauriBuildConfig from "../examples/web-tauri/tauri-build.json.txt?raw";
	import tauriViteConfig from "../examples/web-tauri/vite.config.ts.txt?raw";
	import { getInstallationGuide } from "../_data";
	import CommandBlock from "./command-block.svelte";
	import SourceBlock from "./source-block.svelte";

	import { AlertInfoIcon, AlertWarningIcon } from "#lib/icons.ts";

	import * as Alert from "#lib/components/ui/alert/index.ts";
	import * as FloatingMenu from "#lib/components/ui/floating-menu/index.ts";
	import * as ToggleGroup from "#lib/components/ui/toggle-group/index.ts";
	import * as Typography from "#lib/components/ui/typography/index.ts";

	let { kind }: InstallationGuideProps = $props();

	const webPackages =
		"@floating-ui/dom @internationalized/date @tabler/icons-svelte @tanstack/svelte-table bits-ui clsx country-flag-icons embla-carousel-svelte github-slugger gridstack gsap hast-util-from-html hast-util-sanitize hast-util-to-html layerchart libphonenumber-js mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm mode-watcher paneforge qrcode-generator runed shiki svelte-dnd-action svelte-sonner tailwind-merge tailwind-variants vaul-svelte";
	const baseDevelopmentPackages =
		"@eslint/js @fontsource-variable/inter @inlang/cli @inlang/paraglide-js @shadcn-svelte/primitives @tailwindcss/vite @types/node eslint eslint-config-prettier eslint-plugin-svelte globals prettier prettier-plugin-svelte prettier-plugin-tailwindcss svelte-check tailwindcss typescript typescript-eslint";
	const packageCommands = {
		bun: {
			create: "bunx sv create xvelte-app",
			enter: "cd xvelte-app",
			add: "bun add",
			addDevelopment: "bun add -D",
			dev: "bun run dev",
			build: "bun run build",
			buildTauri: "bun run build:tauri",
			tauri: "bun tauri dev",
			tauriBuild: "bun tauri build",
			tauriBeforeDev: "bun run dev:tauri",
			tauriBeforeBuild: "bun run build:tauri"
		},
		npm: {
			create: "npx sv create xvelte-app",
			enter: "cd xvelte-app",
			add: "npm install",
			addDevelopment: "npm install -D",
			dev: "npm run dev",
			build: "npm run build",
			buildTauri: "npm run build:tauri",
			tauri: "npm run tauri dev",
			tauriBuild: "npm run tauri build",
			tauriBeforeDev: "npm run dev:tauri",
			tauriBeforeBuild: "npm run build:tauri"
		},
		pnpm: {
			create: "pnpm dlx sv create xvelte-app",
			enter: "cd xvelte-app",
			add: "pnpm add",
			addDevelopment: "pnpm add -D",
			dev: "pnpm dev",
			build: "pnpm build",
			buildTauri: "pnpm build:tauri",
			tauri: "pnpm tauri dev",
			tauriBuild: "pnpm tauri build",
			tauriBeforeDev: "pnpm dev:tauri",
			tauriBeforeBuild: "pnpm build:tauri"
		}
	} satisfies Record<PackageManager, Record<string, string>>;

	const findLatestRelease =
		"XVELTE_RELEASE=$(curl -fsSL https://api.github.com/repos/XurxoMF/xvelte/releases/latest | grep '\"tag_name\"' | cut -d '\"' -f 4)";
	const cloneRelease = 'git clone --depth 1 --branch "$XVELTE_RELEASE" https://github.com/XurxoMF/xvelte.git .xvelte-source';
	const copyWebLibrary = "cp -R .xvelte-source/src/lib/. src/lib/ && rm -rf src/lib/tauri";
	const copyCompleteLibrary = "cp -R .xvelte-source/src/lib/. src/lib/";
	const copyStyles = "cp .xvelte-source/src/routes/layout.css src/routes/layout.css";
	const copyMessages = "cp -R .xvelte-source/messages ./messages";
	const copyInlangProject = "cp -R .xvelte-source/project.inlang ./project.inlang";
	const copyTooling = "cp .xvelte-source/.prettierrc .xvelte-source/.prettierignore .xvelte-source/eslint.config.js ./";
	const copyTauriApplication = "cp -R .xvelte-source/src-tauri ./src-tauri";
	const createSkillDirectory = "mkdir -p .agents/skills/xvelte";
	const copySkill = "cp -R .xvelte-source/.agents/skills/xvelte/. .agents/skills/xvelte/";
	const removeSource = "rm -rf .xvelte-source";

	let packageManager: PackageManager = $state("bun");
	let serverRuntime: ServerRuntime = $state("bun");
	let guide = $derived(getInstallationGuide(kind));
	let isSsr = $derived(kind === "web-ssr");
	let includesTauri = $derived(kind === "web-tauri");
	let adapterPackage = $derived(isSsr ? `@sveltejs/adapter-${serverRuntime}` : "@sveltejs/adapter-static");
	let runtimePackages = $derived(includesTauri ? `${webPackages} @tauri-apps/api @tauri-apps/plugin-fs` : webPackages);
	let developmentPackages = $derived(`${baseDevelopmentPackages} ${adapterPackage}${includesTauri ? " @tauri-apps/cli" : ""}`);
	let scripts = $derived(
		kind === "web-ssr" ? (serverRuntime === "bun" ? ssrBunScripts : ssrNodeScripts) : includesTauri ? tauriScripts : staticScripts
	);
	let viteConfig = $derived(
		kind === "web-ssr"
			? serverRuntime === "bun"
				? ssrBunViteConfig
				: ssrNodeViteConfig
			: kind === "web-ssg"
				? ssgViteConfig
				: kind === "web-spa"
					? spaViteConfig
					: tauriViteConfig
	);
	let layoutOptions = $derived(kind === "web-ssr" ? ssrLayout : kind === "web-ssg" ? ssgLayout : kind === "web-spa" ? spaLayout : tauriLayout);
	let buildCommand = $derived(isSsr && serverRuntime === "bun" ? "bun run --bun build" : packageCommands[packageManager].build);
	let productionCommand = $derived(serverRuntime === "bun" ? "bun ./build" : "node build");
	let selectedTauriBuildConfig = $derived(
		tauriBuildConfig
			.replace("bun run dev:tauri", packageCommands[packageManager].tauriBeforeDev)
			.replace("bun run build:tauri", packageCommands[packageManager].tauriBeforeBuild)
	);

	/** Keeps the package-manager selector from entering an empty single-selection state. */
	function selectPackageManager(value: string) {
		if (value === "bun" || value === "npm" || value === "pnpm") packageManager = value;
	}

	/** Keeps the SSR runtime selector on one of the documented official adapters. */
	function selectServerRuntime(value: string) {
		if (value === "bun" || value === "node") serverRuntime = value;
	}
</script>

<main class="mx-auto w-full max-w-5xl px-5 pt-10 pb-28 sm:px-8 sm:pt-14">
	<a href={resolve("/installation")} class="text-sm font-medium text-primary underline-offset-4 hover:underline">← All installation paths</a>

	<header class="mt-6 max-w-3xl">
		<Typography.P class="font-medium text-primary">{guide.badge}</Typography.P>
		<Typography.H1>{guide.title}</Typography.H1>
		<Typography.Leading>{guide.description}</Typography.Leading>
	</header>

	{#if kind === "web-ssr"}
		<Alert.Root variant="info" role="status" class="mt-8">
			<AlertInfoIcon aria-hidden="true" />
			<Alert.Title>Use this for dynamic public pages</Alert.Title>
			<Alert.Description>
				Requests such as <Typography.InlineCode>?page=2</Typography.InlineCode> can receive complete, query-specific HTML when the page load function reads
				<Typography.InlineCode>url.searchParams</Typography.InlineCode>.
			</Alert.Description>
		</Alert.Root>
	{:else if kind === "web-ssg"}
		<Alert.Root variant="info" role="status" class="mt-8">
			<AlertInfoIcon aria-hidden="true" />
			<Alert.Title>Static HTML can still provide excellent SEO</Alert.Title>
			<Alert.Description>
				Every URL must be known during the build. Prefer distinct paths for pagination; arbitrary query combinations cannot produce separate files.
			</Alert.Description>
		</Alert.Root>
	{:else}
		<Alert.Root variant="warning" role="status" class="mt-8">
			<AlertWarningIcon aria-hidden="true" />
			<Alert.Title>This installation has no application server</Alert.Title>
			<Alert.Description>
				Initial HTML contains the application shell. Do not rely on server actions, private environment values, or server-only load functions.
			</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="mt-14 space-y-12">
		<section class="space-y-4" aria-labelledby="create-project">
			<Typography.H2 id="create-project">1. Create the project</Typography.H2>
			<Typography.P class="text-muted-foreground">Choose the minimal SvelteKit template with TypeScript and no add-ons.</Typography.P>
			<CommandBlock title="Create the SvelteKit project" code={packageCommands[packageManager].create} />
			<CommandBlock title="Enter the project" code={packageCommands[packageManager].enter} />
		</section>

		<section class="space-y-4" aria-labelledby="install-packages">
			<Typography.H2 id="install-packages">2. Install the packages</Typography.H2>
			{#if includesTauri}<Typography.P class="text-muted-foreground">
					This single pass includes the web collection, Tauri frontend APIs, native CLI, and static adapter.
				</Typography.P>{/if}
			<CommandBlock title="Runtime packages" code={`${packageCommands[packageManager].add} ${runtimePackages}`} />
			<CommandBlock title="Development packages" code={`${packageCommands[packageManager].addDevelopment} ${developmentPackages}`} />
		</section>

		{#if includesTauri}
			<Alert.Root variant="warning" role="status">
				<AlertWarningIcon aria-hidden="true" />
				<Alert.Title>Install the native prerequisites first</Alert.Title>
				<Alert.Description>
					Follow Tauri's <a class="underline" href="https://v2.tauri.app/start/prerequisites/">official prerequisites guide</a> for Rust and the target
					operating systems.
				</Alert.Description>
			</Alert.Root>
		{/if}

		<section class="space-y-4" aria-labelledby="download-xvelte">
			<Typography.H2 id="download-xvelte">3. Download the latest xvelte release</Typography.H2>
			<Typography.P class="text-muted-foreground">These commands require a POSIX-compatible shell.</Typography.P>
			<CommandBlock title="Find the latest release" code={findLatestRelease} />
			<CommandBlock title="Clone that release" code={cloneRelease} />
		</section>

		<section class="space-y-4" aria-labelledby="copy-xvelte">
			<Typography.H2 id="copy-xvelte">4. Copy xvelte</Typography.H2>
			<CommandBlock title="Library" code={includesTauri ? copyCompleteLibrary : copyWebLibrary} />
			{#if includesTauri}<CommandBlock title="Tauri application" code={copyTauriApplication} />{/if}
			<CommandBlock title="Global styles" code={copyStyles} />
			<CommandBlock title="English messages" code={copyMessages} />
			<CommandBlock title="Paraglide project" code={copyInlangProject} />
			<CommandBlock title="Lint and formatting configuration" code={copyTooling} />
		</section>

		<section class="space-y-4" aria-labelledby="project-scripts">
			<Typography.H2 id="project-scripts">5. Add the project scripts</Typography.H2>
			<Typography.P class="text-muted-foreground">
				Merge this <Typography.InlineCode>scripts</Typography.InlineCode> object into <Typography.InlineCode>package.json</Typography.InlineCode>.
			</Typography.P>
			<SourceBlock title="package.json" code={scripts} language="json" />
		</section>

		<section class="space-y-4" aria-labelledby="configure-application">
			<Typography.H2 id="configure-application">6. Configure the application</Typography.H2>
			<SourceBlock title="vite.config.ts" code={viteConfig} language="typescript" />
			<SourceBlock title="src/routes/+layout.ts" code={layoutOptions} language="typescript" />
			<SourceBlock title="src/routes/+layout.svelte" code={rootLayout} language="svelte" />
			{#if kind === "web-spa"}
				<Alert.Root variant="info">
					<AlertInfoIcon aria-hidden="true" />
					<Alert.Title>Match the fallback to the hosting provider</Alert.Title>
					<Alert.Description>
						The example writes <Typography.InlineCode>200.html</Typography.InlineCode>. Some hosts require <Typography.InlineCode>
							404.html
						</Typography.InlineCode>, <Typography.InlineCode>index.html</Typography.InlineCode>, or a rewrite rule.
					</Alert.Description>
				</Alert.Root>
			{:else if includesTauri}
				<Typography.P class="text-muted-foreground">
					Merge this build object into <Typography.InlineCode>src-tauri/tauri.conf.json</Typography.InlineCode>. Replace the xvelte product identifier
					and icons before distribution.
				</Typography.P>
				<SourceBlock title="src-tauri/tauri.conf.json" code={selectedTauriBuildConfig} language="json" />
			{/if}
		</section>

		<section class="space-y-4" aria-labelledby="agent-skill">
			<Typography.H2 id="agent-skill">7. Optionally install the xvelte agent skill</Typography.H2>
			<Typography.P class="text-muted-foreground">
				Copy it when coding agents should discover the collection and follow its composition rules.
			</Typography.P>
			<CommandBlock title="Create the skill directory" code={createSkillDirectory} />
			<CommandBlock title="Copy the skill" code={copySkill} />
		</section>

		<section class="space-y-4" aria-labelledby="run-application">
			<Typography.H2 id="run-application">8. Run and build</Typography.H2>
			{#if includesTauri}
				<CommandBlock title="Start the website" code={packageCommands[packageManager].dev} />
				<CommandBlock title="Start the Tauri application" code={packageCommands[packageManager].tauri} />
				<CommandBlock title="Build the website" code={packageCommands[packageManager].build} />
				<CommandBlock title="Build only the Tauri frontend" code={packageCommands[packageManager].buildTauri} />
				<CommandBlock title="Build the native application" code={packageCommands[packageManager].tauriBuild} />
			{:else}
				<CommandBlock title="Start development" code={packageCommands[packageManager].dev} />
				<CommandBlock title="Build for production" code={buildCommand} />
			{/if}
			{#if isSsr}<CommandBlock title={`Start the ${serverRuntime === "bun" ? "Bun" : "Node"} server`} code={productionCommand} />{/if}
		</section>

		<section class="rounded-2xl border bg-muted/30 p-6 sm:p-8" aria-labelledby="finish-installation">
			<Typography.H2 id="finish-installation">Finish up</Typography.H2>
			<Typography.P class="mt-3 text-muted-foreground">
				Run the checks, replace the xvelte favicon{includesTauri ? " and native icons" : ""}, commit the copied source, and only then remove the
				temporary clone.
			</Typography.P>
			<div class="mt-5"><CommandBlock title="Clean up" code={removeSource} /></div>
		</section>
	</div>

	<FloatingMenu.Root position="bottom-right" class="fixed">
		<FloatingMenu.Group role="group" aria-label="Installation options">
			{#if isSsr}
				<span class="px-2 text-xs font-medium text-muted-foreground">Server</span>
				<ToggleGroup.Root
					type="single"
					value={serverRuntime}
					onValueChange={selectServerRuntime}
					variant="outline"
					size="sm"
					aria-label="Choose the production server"
				>
					<ToggleGroup.Item value="bun">Bun</ToggleGroup.Item><ToggleGroup.Item value="node">Node</ToggleGroup.Item>
				</ToggleGroup.Root>
			{/if}
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
