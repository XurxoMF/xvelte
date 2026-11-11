<script lang="ts">
	import { AlertInfoIcon, AlertWarningIcon } from "$lib/icons";

	import { useHighlightedCode } from "$lib/hooks/use-highlighted-code.svelte";

	import * as Alert from "$lib/components/ui/alert";
	import * as CodeBlock from "$lib/components/ui/code-block";
	import * as FloatingMenu from "$lib/components/ui/floating-menu";
	import * as ToggleGroup from "$lib/components/ui/toggle-group";
	import * as Typography from "$lib/components/ui/typography";

	type PackageManager = "bun" | "npm" | "pnpm";
	type HighlightedCode = ReturnType<typeof useHighlightedCode>;

	type PackageManagerCommands = {
		create: string;
		enterProject: string;
		installRuntime: string;
		installDevelopment: string;
		runWeb: string;
		installTauriRuntime: string;
		installTauriDevelopment: string;
		runTauri: string;
		tauriDevCommand: string;
		tauriBuildCommand: string;
	};

	const webPackages =
		"@floating-ui/dom @internationalized/date @tabler/icons-svelte @tanstack/svelte-table bits-ui clsx country-flag-icons embla-carousel-svelte github-slugger gridstack gsap hast-util-from-html hast-util-sanitize hast-util-to-html layerchart libphonenumber-js mdast-util-from-markdown mdast-util-gfm micromark-extension-gfm mode-watcher paneforge qrcode-generator runed shiki svelte-dnd-action svelte-sonner tailwind-merge tailwind-variants vaul-svelte";
	const webDevelopmentPackages =
		"@eslint/js @fontsource-variable/inter @inlang/cli @inlang/paraglide-js @shadcn-svelte/primitives @sveltejs/adapter-static @tailwindcss/vite @types/node eslint eslint-config-prettier eslint-plugin-svelte globals prettier prettier-plugin-svelte prettier-plugin-tailwindcss svelte-check tailwindcss typescript typescript-eslint";

	const commands = {
		bun: {
			create: "bunx sv create xvelte-app",
			enterProject: "cd xvelte-app",
			installRuntime: `bun add ${webPackages}`,
			installDevelopment: `bun add -D ${webDevelopmentPackages}`,
			runWeb: "bun run dev",
			installTauriRuntime: "bun add @tauri-apps/api @tauri-apps/plugin-fs",
			installTauriDevelopment: "bun add -D @tauri-apps/cli",
			runTauri: "bun tauri dev",
			tauriDevCommand: "bun dev",
			tauriBuildCommand: "bun run build:tauri"
		},
		npm: {
			create: "npx sv create xvelte-app",
			enterProject: "cd xvelte-app",
			installRuntime: `npm install ${webPackages}`,
			installDevelopment: `npm install -D ${webDevelopmentPackages}`,
			runWeb: "npm run dev",
			installTauriRuntime: "npm install @tauri-apps/api @tauri-apps/plugin-fs",
			installTauriDevelopment: "npm install -D @tauri-apps/cli",
			runTauri: "npm run tauri dev",
			tauriDevCommand: "npm run dev",
			tauriBuildCommand: "npm run build:tauri"
		},
		pnpm: {
			create: "pnpm dlx sv create xvelte-app",
			enterProject: "cd xvelte-app",
			installRuntime: `pnpm add ${webPackages}`,
			installDevelopment: `pnpm add -D ${webDevelopmentPackages}`,
			runWeb: "pnpm dev",
			installTauriRuntime: "pnpm add @tauri-apps/api @tauri-apps/plugin-fs",
			installTauriDevelopment: "pnpm add -D @tauri-apps/cli",
			runTauri: "pnpm tauri dev",
			tauriDevCommand: "pnpm dev",
			tauriBuildCommand: "pnpm build:tauri"
		}
	} satisfies Record<PackageManager, PackageManagerCommands>;

	const findLatestRelease =
		"XVELTE_RELEASE=$(curl -fsSL https://api.github.com/repos/XurxoMF/xvelte/releases/latest | grep '\"tag_name\"' | cut -d '\"' -f 4)";
	const cloneRelease = 'git clone --depth 1 --branch "$XVELTE_RELEASE" https://github.com/XurxoMF/xvelte.git .xvelte-source';
	const copyLibrary = "cp -R .xvelte-source/src/lib/. src/lib/ && rm -rf src/lib/tauri";
	const copyStyles = "cp .xvelte-source/src/routes/layout.css src/routes/layout.css";
	const copyMessages = "cp -R .xvelte-source/messages ./messages";
	const copyInlangProject = "cp -R .xvelte-source/project.inlang ./project.inlang";
	const copyTooling = "cp .xvelte-source/.prettierrc .xvelte-source/.prettierignore .xvelte-source/eslint.config.js ./";
	const createSkillDirectory = "mkdir -p .agents/skills/xvelte";
	const copySkill = "cp -R .xvelte-source/.agents/skills/xvelte/. .agents/skills/xvelte/";
	const copyTauriLibrary = "cp -R .xvelte-source/src/lib/tauri src/lib/tauri";
	const copyTauriApplication = "cp -R .xvelte-source/src-tauri ./src-tauri";
	const removeSource = "rm -rf .xvelte-source";

	const packageScripts = `{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"build:tauri": "vite build --mode tauri",
		"preview": "vite preview",
		"prepare": "svelte-kit sync || echo ''",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"lint": "prettier --check . && eslint .",
		"format": "prettier --write .",
		"tauri": "tauri",
		"paraglide:compile": "paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide",
		"paraglide:translate": "inlang machine translate --project ./project.inlang"
	}
}`;

	const viteConfig = `import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter({ fallback: "200.html" })
		}),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
			emitTsDeclarations: true,
			strategy: ["localStorage", "preferredLanguage", "baseLocale"]
		})
	]
});`;

	const webLayoutOptions = `import { dev } from "$app/environment";

export const prerender = true;
export const ssr = !dev;`;

	const rootLayout = `<script lang="ts">
	import { ModeWatcher } from "mode-watcher";

	import "./layout.css";

	let { children } = $props();
</scr${"ipt"}>

<ModeWatcher />

{@render children()}`;

	const tauriLayoutOptions = `import { dev } from "$app/environment";

const isTauriBuild = import.meta.env.MODE === "tauri";

export const prerender = true;
export const ssr = !dev && !isTauriBuild;`;

	const tauriViteServer = `export default defineConfig({
	// Keep the existing plugins.
	server: {
		port: 5173,
		strictPort: true,
		watch: {
			ignored: ["**/src-tauri/**"]
		}
	}
});`;

	const packageScriptLines = useHighlightedCode(
		() => packageScripts,
		() => "json"
	);
	const viteConfigLines = useHighlightedCode(
		() => viteConfig,
		() => "typescript"
	);
	const webLayoutOptionsLines = useHighlightedCode(
		() => webLayoutOptions,
		() => "typescript"
	);
	const rootLayoutLines = useHighlightedCode(
		() => rootLayout,
		() => "svelte"
	);
	const tauriLayoutOptionsLines = useHighlightedCode(
		() => tauriLayoutOptions,
		() => "typescript"
	);
	const tauriViteServerLines = useHighlightedCode(
		() => tauriViteServer,
		() => "typescript"
	);

	let packageManager: PackageManager = $state("bun");

	/** Keeps the package-manager selector from entering Toggle Group's empty single-selection state. */
	function selectPackageManager(value: string) {
		if (value === "bun" || value === "npm" || value === "pnpm") packageManager = value;
	}
</script>

{#snippet CommandBlock(title: string, code: string)}
	<CodeBlock.Root>
		<CodeBlock.Header>
			<CodeBlock.Title>{title}</CodeBlock.Title>
			<CodeBlock.Actions>
				<CodeBlock.CopyButton value={code} />
			</CodeBlock.Actions>
		</CodeBlock.Header>
		<CodeBlock.Content {code} />
	</CodeBlock.Root>
{/snippet}

{#snippet SourceBlock(title: string, code: string, lines: HighlightedCode)}
	<CodeBlock.Root>
		<CodeBlock.Header>
			<CodeBlock.Title>{title}</CodeBlock.Title>
			<CodeBlock.Actions>
				<CodeBlock.CopyButton value={code} />
			</CodeBlock.Actions>
		</CodeBlock.Header>
		<CodeBlock.Content lineNumbers>
			{#each lines.current as line, index (index)}
				<CodeBlock.Line code={line} />
			{/each}
		</CodeBlock.Content>
	</CodeBlock.Root>
{/snippet}

<svelte:head>
	<title>Installation - xvelte</title>
	<meta
		name="description"
		content="Install the complete xvelte web collection in a new SvelteKit project, then optionally add its Tauri application shell."
	/>
</svelte:head>

<main class="mx-auto w-full max-w-5xl px-5 pt-10 pb-28 sm:px-8 sm:pt-14">
	<header class="max-w-3xl">
		<Typography.P class="font-medium text-primary">SvelteKit first, Tauri when you need it</Typography.P>
		<Typography.H1>Install xvelte</Typography.H1>
		<Typography.Leading>Start with the complete web collection. The native application is a separate second step.</Typography.Leading>
	</header>

	<Alert.Root variant="info" role="status" class="mt-8">
		<AlertInfoIcon aria-hidden="true" />
		<Alert.Title>Installing only some components?</Alert.Title>
		<Alert.Description>
			Skip this page. Open each component's guide and copy only the files, packages, styles, icons, and messages listed there.
		</Alert.Description>
	</Alert.Root>

	<div class="mt-14 space-y-20">
		<section aria-labelledby="web-installation">
			<div class="max-w-3xl">
				<Typography.P class="font-medium text-primary">Part one</Typography.P>
				<Typography.H2 id="web-installation">Web installation</Typography.H2>
				<Typography.P class="mt-3 text-muted-foreground">The commands use a POSIX-compatible shell.</Typography.P>
			</div>

			<div class="mt-10 space-y-12">
				<div class="space-y-4">
					<Typography.H3>1. Create the project</Typography.H3>
					<Typography.P class="text-muted-foreground">Choose the minimal SvelteKit template with TypeScript and no add-ons.</Typography.P>
					{@render CommandBlock("Create the SvelteKit project", commands[packageManager].create)}
					{@render CommandBlock("Enter the project", commands[packageManager].enterProject)}
				</div>

				<div class="space-y-4">
					<Typography.H3>2. Install every web package</Typography.H3>
					{@render CommandBlock("Runtime packages", commands[packageManager].installRuntime)}
					{@render CommandBlock("Development packages", commands[packageManager].installDevelopment)}
				</div>

				<div class="space-y-4">
					<Typography.H3>3. Download the latest xvelte release</Typography.H3>
					{@render CommandBlock("Find the latest release", findLatestRelease)}
					{@render CommandBlock("Clone that release", cloneRelease)}
				</div>

				<div class="space-y-4">
					<Typography.H3>4. Copy xvelte</Typography.H3>
					<Typography.P class="text-muted-foreground">
						The first command copies all of <Typography.InlineCode>src/lib</Typography.InlineCode> and immediately removes its optional Tauri folder.
					</Typography.P>
					{@render CommandBlock("Library", copyLibrary)}
					{@render CommandBlock("Global styles", copyStyles)}
					{@render CommandBlock("English messages", copyMessages)}
					{@render CommandBlock("Paraglide project", copyInlangProject)}
					{@render CommandBlock("Lint and formatting configuration", copyTooling)}
				</div>

				<div class="space-y-4">
					<Typography.H3>5. Add the project scripts</Typography.H3>
					<Typography.P class="text-muted-foreground">
						Merge this complete <Typography.InlineCode>scripts</Typography.InlineCode> object into <Typography.InlineCode
							>package.json</Typography.InlineCode
						>.
					</Typography.P>
					{@render SourceBlock("package.json", packageScripts, packageScriptLines)}
				</div>

				<div class="space-y-4">
					<Typography.H3>6. Configure the application</Typography.H3>
					{@render SourceBlock("vite.config.ts", viteConfig, viteConfigLines)}
					{@render SourceBlock("src/routes/+layout.ts", webLayoutOptions, webLayoutOptionsLines)}
					{@render SourceBlock("src/routes/+layout.svelte", rootLayout, rootLayoutLines)}
				</div>

				<div class="space-y-4">
					<Typography.H3>7. Optionally install the xvelte agent skill</Typography.H3>
					<Typography.P class="text-muted-foreground">
						Copy it when coding agents should discover the installed collection and follow its composition rules.
					</Typography.P>
					{@render CommandBlock("Create the skill directory", createSkillDirectory)}
					{@render CommandBlock("Copy the skill", copySkill)}
				</div>

				<div class="space-y-4">
					<Typography.H3>8. Run the website</Typography.H3>
					{@render CommandBlock("Start the development server", commands[packageManager].runWeb)}
				</div>
			</div>
		</section>

		<section aria-labelledby="tauri-installation" class="border-t pt-16">
			<div class="max-w-3xl">
				<Typography.P class="font-medium text-primary">Part two · optional</Typography.P>
				<Typography.H2 id="tauri-installation">Add Tauri</Typography.H2>
				<Typography.P class="mt-3 text-muted-foreground">Keep the same SvelteKit source and add the native shell around it.</Typography.P>
			</div>

			<Alert.Root variant="warning" role="status" class="mt-8">
				<AlertWarningIcon aria-hidden="true" />
				<Alert.Title>Install the native prerequisites first</Alert.Title>
				<Alert.Description>
					Follow Tauri's <a href="https://v2.tauri.app/start/prerequisites/">official prerequisites guide</a> for Rust and your operating system.
				</Alert.Description>
			</Alert.Root>

			<div class="mt-10 space-y-12">
				<div class="space-y-4">
					<Typography.H3>1. Install Tauri packages</Typography.H3>
					{@render CommandBlock("Tauri runtime packages", commands[packageManager].installTauriRuntime)}
					{@render CommandBlock("Tauri CLI", commands[packageManager].installTauriDevelopment)}
				</div>

				<div class="space-y-4">
					<Typography.H3>2. Copy the native files</Typography.H3>
					{@render CommandBlock("Frontend helpers", copyTauriLibrary)}
					{@render CommandBlock("Tauri application", copyTauriApplication)}
				</div>

				<div class="space-y-4">
					<Typography.H3>3. Configure the Tauri build</Typography.H3>
					{@render SourceBlock("src/routes/+layout.ts", tauriLayoutOptions, tauriLayoutOptionsLines)}
					<Typography.P class="text-muted-foreground">
						Add <Typography.InlineCode>server</Typography.InlineCode> beside <Typography.InlineCode>plugins</Typography.InlineCode> in
						<Typography.InlineCode>vite.config.ts</Typography.InlineCode>.
					</Typography.P>
					{@render SourceBlock("vite.config.ts", tauriViteServer, tauriViteServerLines)}
				</div>

				<div class="space-y-4">
					<Typography.H3>4. Check src-tauri/tauri.conf.json</Typography.H3>
					<Typography.P class="text-muted-foreground">
						Set <Typography.InlineCode>beforeDevCommand</Typography.InlineCode> to
						<Typography.InlineCode>{commands[packageManager].tauriDevCommand}</Typography.InlineCode> and
						<Typography.InlineCode>beforeBuildCommand</Typography.InlineCode> to
						<Typography.InlineCode>{commands[packageManager].tauriBuildCommand}</Typography.InlineCode>.
					</Typography.P>
				</div>

				<div class="space-y-4">
					<Typography.H3>5. Run the native application</Typography.H3>
					{@render CommandBlock("Start Tauri", commands[packageManager].runTauri)}
				</div>
			</div>
		</section>

		<section aria-labelledby="finish-installation" class="rounded-2xl border bg-muted/30 p-5 sm:p-8">
			<div class="max-w-3xl">
				<Typography.P class="font-medium text-primary">Finish up</Typography.P>
				<Typography.H2 id="finish-installation">Notes before you ship</Typography.H2>
			</div>

			<div class="mt-8 grid gap-4 lg:grid-cols-2">
				<Alert.Root variant="warning" role="status">
					<AlertWarningIcon aria-hidden="true" />
					<Alert.Title>Replace the xvelte branding</Alert.Title>
					<Alert.Description>
						The favicon and Tauri icons included with xvelte belong to xvelte. Replace the project favicon and every file in
						<Typography.InlineCode>src-tauri/icons</Typography.InlineCode> with the final application's artwork.
					</Alert.Description>
				</Alert.Root>

				<Alert.Root variant="info" role="status">
					<AlertInfoIcon aria-hidden="true" />
					<Alert.Title>The copied code is now yours</Alert.Title>
					<Alert.Description>Commit it with the application and review later xvelte releases before merging their changes.</Alert.Description>
				</Alert.Root>
			</div>

			<div class="mt-8 space-y-4">
				<Typography.H3>Remove the temporary clone</Typography.H3>
				<Typography.P class="text-muted-foreground">Run this only after copying the optional skill and any Tauri files you need.</Typography.P>
				{@render CommandBlock("Clean up", removeSource)}
			</div>
		</section>
	</div>

	<FloatingMenu.Root position="bottom-right" class="fixed">
		<FloatingMenu.Group role="group" aria-label="Installation package manager">
			<span class="px-2 text-xs font-medium text-muted-foreground">Package manager</span>

			<ToggleGroup.Root
				type="single"
				value={packageManager}
				onValueChange={selectPackageManager}
				variant="outline"
				size="sm"
				spacing={0}
				aria-label="Choose a package manager"
			>
				<ToggleGroup.Item value="bun">Bun</ToggleGroup.Item>
				<ToggleGroup.Item value="npm">npm</ToggleGroup.Item>
				<ToggleGroup.Item value="pnpm">pnpm</ToggleGroup.Item>
			</ToggleGroup.Root>
		</FloatingMenu.Group>
	</FloatingMenu.Root>
</main>
